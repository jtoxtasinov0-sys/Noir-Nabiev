"""
3-sahifadagi "talabalar bilan intervyu" konsept rasmlarini Gemini orqali chizadi.
Boshlovchilarning haqiqiy rasmlari (Noir va Mavluda) namuna sifatida yuboriladi.

Ishga tushirish (repo ildizidan):  python3 embassy/gen_images.py [interview-1 ...]
Kalit: muhitning Network secrets bo'limida generativelanguage.googleapis.com uchun
(x-goog-api-key sarlavhasi) saqlangan bo'lsa, proksi uni o'zi qo'shadi.
Yoki bir martalik: GEMINI_API_KEY=... python3 embassy/gen_images.py
Boshqa model kerak bo'lsa: GEMINI_IMAGE_MODEL=...

PDF'da bu rasmlar "Konsept-vizual" deb belgilanadi: ular haqiqiy suratlar emas.
"""
import base64, io, json, os, sys, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT = os.path.join(HERE, "img")

REFS = {
    "noir": ["assets/img/noir/avatar.jpg", "assets/img/noir/photo-1.jpg"],
    "mavluda": ["assets/img/mavluda/avatar-hq.jpg", "assets/img/mavluda/photo-2.jpg"],
}
WHO = {
    "noir": "the young man with short black hair and round black glasses shown in the first reference photos",
    "mavluda": "the young woman with long dark brown hair shown in the last reference photos",
}
STYLE = ("Keep both hosts' faces, hairstyles and glasses exactly like in the reference photos. "
         "Realistic documentary travel-show photo, natural daylight, candid moment, 35mm lens, "
         "warm natural colours, casual modern clothes. No text, no captions, no logos, no watermarks.")
SHOTS = {
    "interview-1": ("1:1", f"{WHO['noir'].capitalize()} holds a handheld microphone and interviews a smiling "
                    "Central Asian female student in her early twenties on a university campus in New York City, "
                    f"brick buildings and autumn trees behind them. {WHO['mavluda'].capitalize()} stands next to him "
                    "and listens. " + STYLE),
    "interview-2": ("3:4", f"{WHO['mavluda'].capitalize()} holds a handheld microphone and talks with two Central Asian "
                    "university students, a young man and a young woman, sitting on stone steps in downtown Chicago "
                    "with skyscrapers behind them. " + STYLE),
    "interview-3": ("3:4", f"{WHO['noir'].capitalize()} and {WHO['mavluda']} laugh together with three Central Asian "
                    "university students on a sunny palm-lined university campus in Los Angeles; he holds a "
                    "handheld microphone. " + STYLE),
}


def ref_parts():
    parts = []
    for files in REFS.values():
        for f in files:
            im = Image.open(os.path.join(ROOT, f)).convert("RGB")
            im.thumbnail((768, 768))
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=88)
            parts.append({"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}})
    return parts


def generate(name, aspect, prompt, refs):
    body = {
        "contents": [{"parts": refs + [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}},
    }
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), method="POST", headers={
        "Content-Type": "application/json",
        # Kalit muhitda saqlangan bo'lsa, proksi bu qiymatni haqiqiy kalit bilan almashtiradi.
        "x-goog-api-key": os.environ.get("GEMINI_API_KEY", "set-by-proxy"),
    })
    with urllib.request.urlopen(req, timeout=240) as r:
        data = json.load(r)
    for part in data["candidates"][0]["content"]["parts"]:
        inline = part.get("inlineData") or part.get("inline_data")
        if inline:
            img = Image.open(io.BytesIO(base64.b64decode(inline["data"]))).convert("RGB")
            path = os.path.join(OUT, name + ".jpg")
            img.save(path, quality=90)
            return path
    raise RuntimeError(f"{name}: javobda rasm yo'q: {json.dumps(data)[:400]}")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:]
    refs = ref_parts()
    for name, (aspect, prompt) in SHOTS.items():
        if only and name not in only:
            continue
        print("ok", generate(name, aspect, prompt, refs))
    print("Endi PDF'ni qayta yig'ing: node embassy/build.js")
