#!/usr/bin/env python3
"""Free LLM fallback: send a prompt to a free LLM API instead of Claude.

Used when Claude's token usage is at or above 95% (see CLAUDE.md, "Token budget").
Tries providers in order and returns the first answer:
  1. Groq        (api.groq.com)                     openai/gpt-oss-120b
  2. Gemini      (generativelanguage.googleapis.com) gemini-3.5-flash
  3. OpenRouter  (openrouter.ai)                     google/gemma-4-31b-it:free

In the cloud session, the agent proxy injects each provider's real API key, so no
key is needed here. Elsewhere, set GROQ_API_KEY / GEMINI_API_KEY / OPENROUTER_API_KEY.

Usage:
  python3 tools/free_llm.py "Write 3 YouTube title ideas about ..."
  echo "long prompt" | python3 tools/free_llm.py -
  python3 tools/free_llm.py --system "You are a copywriter." --provider gemini "..."
  python3 tools/free_llm.py --file social/scripts/ABC.md "Summarize this script."
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

PROVIDERS = [
    ("groq", "https://api.groq.com/openai/v1/chat/completions",
     "GROQ_API_KEY", "openai/gpt-oss-120b"),
    ("gemini", "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
     "GEMINI_API_KEY", "gemini-3.5-flash"),
    ("openrouter", "https://openrouter.ai/api/v1/chat/completions",
     "OPENROUTER_API_KEY", "google/gemma-4-31b-it:free"),
]


def ask(provider, url, key_env, model, messages, max_tokens, timeout):
    body = json.dumps({"model": model, "messages": messages,
                       "max_tokens": max_tokens}).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "Content-Type": "application/json",
        # "proxy-injected" is replaced by the agent proxy with the real key.
        "Authorization": "Bearer " + os.environ.get(key_env, "proxy-injected"),
        "User-Agent": "northstar-free-llm/1.0",
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = json.load(r)
    text = (data["choices"][0]["message"].get("content") or "").strip()
    if not text:
        raise RuntimeError("empty response")
    return text


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("prompt", help='prompt text, or "-" to read stdin')
    p.add_argument("--system", help="optional system prompt")
    p.add_argument("--file", action="append", default=[],
                   help="attach a text file's contents to the prompt (repeatable)")
    p.add_argument("--provider", choices=[x[0] for x in PROVIDERS],
                   help="use only this provider (default: try all in order)")
    p.add_argument("--model", help="override the model for --provider")
    p.add_argument("--max-tokens", type=int, default=2048)
    p.add_argument("--timeout", type=int, default=90)
    a = p.parse_args()

    prompt = sys.stdin.read() if a.prompt == "-" else a.prompt
    for path in a.file:
        with open(path, encoding="utf-8") as f:
            prompt += f"\n\n--- {path} ---\n{f.read()}"
    messages = ([{"role": "system", "content": a.system}] if a.system else []) + \
               [{"role": "user", "content": prompt}]

    chain = [x for x in PROVIDERS if not a.provider or x[0] == a.provider]
    errors = []
    for name, url, key_env, model in chain:
        if a.model and a.provider:
            model = a.model
        try:
            text = ask(name, url, key_env, model, messages, a.max_tokens, a.timeout)
            print(f"[free-llm: {name} / {model}]", file=sys.stderr)
            print(text)
            return 0
        except urllib.error.HTTPError as e:
            errors.append(f"{name}: HTTP {e.code} {e.read()[:200].decode(errors='replace')}")
        except Exception as e:  # network, timeout, bad JSON, empty answer
            errors.append(f"{name}: {e}")
    print("All free LLM providers failed:\n  " + "\n  ".join(errors), file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
