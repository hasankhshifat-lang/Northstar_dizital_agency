"""VibeVoice-1.5B narration for As Printed. usage: vv_tts.py lines.json out_dir [--voice ref.wav] [--steps 10] [--cfg 1.3]
Writes <id>.wav (24 kHz) per line and dur.json, like the library's tts.py, so the rest of the pipeline is unchanged."""
import sys, os, json, time, argparse
import torch, soundfile as sf
from vibevoice.modular.modeling_vibevoice_inference import VibeVoiceForConditionalGenerationInference
from vibevoice.processor.vibevoice_processor import VibeVoiceProcessor
ap = argparse.ArgumentParser(); ap.add_argument('lines'); ap.add_argument('out'); ap.add_argument('--voice', default=os.path.join(os.path.dirname(__file__), 'narrator_ref.wav'))
ap.add_argument('--steps', type=int, default=10); ap.add_argument('--cfg', type=float, default=1.3); ap.add_argument('--model', default='microsoft/VibeVoice-1.5B')
ap.add_argument('--only', default=''); a = ap.parse_args()
torch.set_num_threads(os.cpu_count())
lines = json.load(open(a.lines)); os.makedirs(a.out, exist_ok=True)
proc = VibeVoiceProcessor.from_pretrained(a.model)
model = VibeVoiceForConditionalGenerationInference.from_pretrained(a.model, torch_dtype=torch.float32, device_map='cpu', attn_implementation='sdpa')
model.eval(); model.set_ddpm_inference_steps(num_steps=a.steps)
dp = os.path.join(a.out, 'dur.json'); dur = json.load(open(dp)) if os.path.exists(dp) else {}
tp = os.path.join(a.out, 'texts.json'); done = json.load(open(tp)) if os.path.exists(tp) else {}
for L in lines:
    if a.only and L['id'] not in a.only.split(','): continue
    if not a.only and done.get(L['id']) == L['text'] and os.path.exists(os.path.join(a.out, L['id'] + '.wav')): continue   # unchanged line: keep
    t0 = time.time()
    txt = 'Speaker 1: ' + L['text'].replace('\n', ' ')
    inp = proc(text=[txt], voice_samples=[[a.voice]], padding=True, return_tensors='pt', return_attention_mask=True)
    with torch.inference_mode():
        out = model.generate(**inp, max_new_tokens=None, cfg_scale=a.cfg, tokenizer=proc.tokenizer, generation_config={'do_sample': False}, verbose=False)
    wav = out.speech_outputs[0].float().cpu().numpy().reshape(-1)
    # trim leading/trailing near-silence
    import numpy as np
    thr = 0.01 * max(1e-6, float(np.abs(wav).max())); idx = np.where(np.abs(wav) > thr)[0]
    if len(idx): wav = wav[max(0, idx[0] - 2400): idx[-1] + 4800]
    sf.write(os.path.join(a.out, L['id'] + '.wav'), wav, 24000)
    dur[L['id']] = round(len(wav) / 24000, 3); json.dump(dur, open(dp, 'w'), indent=1)
    done[L['id']] = L['text']; json.dump(done, open(tp, 'w'), indent=1)
    print(L['id'], dur[L['id']], 's audio in', round(time.time() - t0, 1), 's', flush=True)
