"""VibeVoice narration for The Overthinking Pad: one wav per script line, model loaded once.
usage: /opt/vibevoice-env/bin/python vv_lines.py lines.json out_dir [--voice Frank] [--cfg 1.5] [--only id1,id2]
Model microsoft/VibeVoice-Realtime-0.5B (the vibevoice-voiceover skill's model and voices; channel voice: Frank).
Writes <id>.wav (24 kHz, leading/trailing silence trimmed) and dur.json; unchanged lines are kept on re-runs."""
import sys, os, json, time, copy, argparse, re
sys.path.insert(0, '/opt/VibeVoice')
import numpy as np, torch, soundfile as sf
from vibevoice.modular.modeling_vibevoice_streaming_inference import VibeVoiceStreamingForConditionalGenerationInference
from vibevoice.processor.vibevoice_streaming_processor import VibeVoiceStreamingProcessor
from transformers.cache_utils import DynamicCache
from transformers.modeling_outputs import BaseModelOutputWithPast

ap = argparse.ArgumentParser(); ap.add_argument('lines'); ap.add_argument('out')
ap.add_argument('--voice', default='Frank'); ap.add_argument('--cfg', type=float, default=1.5)
ap.add_argument('--steps', type=int, default=5); ap.add_argument('--only', default='')
a = ap.parse_args()
torch.set_num_threads(os.cpu_count())
M = 'microsoft/VibeVoice-Realtime-0.5B'
lines = json.load(open(a.lines)); os.makedirs(a.out, exist_ok=True)
proc = VibeVoiceStreamingProcessor.from_pretrained(M)
model = VibeVoiceStreamingForConditionalGenerationInference.from_pretrained(M, torch_dtype=torch.float32, device_map='cpu', attn_implementation='sdpa')
model.eval(); model.set_ddpm_inference_steps(num_steps=a.steps)
vp = f'/opt/VibeVoice/demo/voices/streaming_model/en-{a.voice}_man.pt'
if not os.path.exists(vp): vp = f'/opt/VibeVoice/demo/voices/streaming_model/en-{a.voice}_woman.pt'
with torch.serialization.safe_globals([BaseModelOutputWithPast, DynamicCache]):
    prompt = torch.load(vp, map_location='cpu', weights_only=False)
dp = os.path.join(a.out, 'dur.json'); dur = json.load(open(dp)) if os.path.exists(dp) else {}
tp = os.path.join(a.out, 'texts.json'); done = json.load(open(tp)) if os.path.exists(tp) else {}
only = set(a.only.split(',')) if a.only else None
for L in lines:
    wavp = os.path.join(a.out, L['id'] + '.wav')
    if only is not None and L['id'] not in only: continue
    if only is None and done.get(L['id']) == L['text'] and os.path.exists(wavp): continue
    t0 = time.time()
    txt = re.sub(r'\[[^\]]*\] ?', '', L['text']).replace('’', "'").replace('“', '"').replace('”', '"')
    inp = proc.process_input_with_cached_prompt(text=txt, cached_prompt=prompt, padding=True, return_tensors='pt', return_attention_mask=True)
    with torch.inference_mode():
        out = model.generate(**inp, max_new_tokens=None, cfg_scale=a.cfg, tokenizer=proc.tokenizer,
                             generation_config={'do_sample': False}, verbose=False, all_prefilled_outputs=copy.deepcopy(prompt))
    wav = out.speech_outputs[0].float().cpu().numpy().reshape(-1)
    thr = 0.02 * max(1e-6, float(np.abs(wav).max())); idx = np.where(np.abs(wav) > thr)[0]
    if len(idx): wav = wav[max(0, idx[0] - 1200): idx[-1] + 3600]
    sf.write(wavp, wav, 24000)
    dur[L['id']] = round(len(wav) / 24000, 3); json.dump(dur, open(dp, 'w'), indent=1)
    done[L['id']] = L['text']; json.dump(done, open(tp, 'w'), indent=1)
    print(L['id'], dur[L['id']], 's audio in', round(time.time() - t0, 1), 's', flush=True)
