"""Transcribe vo/narration.wav with Groq Whisper (whisper-large-v3, word timestamps) -> vo/words.json,
and compare the transcript word by word with vo/script.txt (the VibeVoice take check)."""
import json, os, re, subprocess, sys, difflib, tempfile
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
wav = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'vo', 'narration.wav')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'vo', 'words.json')
tmp = tempfile.mktemp(suffix='.mp3')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '16000', '-b:a', '64k', tmp], check=True)
r = subprocess.run(['curl', '-sS', 'https://api.groq.com/openai/v1/audio/transcriptions', '-H', 'Authorization: Bearer dummy',
    '-F', f'file=@{tmp}', '-F', 'model=whisper-large-v3', '-F', 'response_format=verbose_json', '-F', 'language=en',
    '-F', 'timestamp_granularities[]=word', '-F', 'timestamp_granularities[]=segment'], capture_output=True, text=True)
d = json.loads(r.stdout)
if 'words' not in d: print(r.stdout[:500]); sys.exit(1)
json.dump({'text': d['text'], 'words': d['words']}, open(out, 'w'), indent=0)
norm = lambda s: re.sub(r"[^a-z0-9' ]", ' ', s.lower().replace('-', ' ')).split()
a = norm(open(os.path.join(HERE, 'vo', 'script.txt')).read()); b = norm(d['text'])
print('TRANSCRIPT:', d['text'].strip())
diffs = [(op, ' '.join(a[i1:i2]), ' '.join(b[j1:j2])) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b).get_opcodes() if op != 'equal']
print('DIFFS (script -> heard):', diffs if diffs else 'none')
print('first words:', [(w['word'], round(w['start'], 2)) for w in d['words'][:3]], 'last end:', round(d['words'][-1]['end'], 2))
