"""
3-sahifadagi "talabalar bilan intervyu" konsept rasmlarini Gemini orqali chizadi.
Ishga tushirish (repo ildizidan):  python3 embassy/gen_images.py
Kalit muhitning Network secrets bo'limida generativelanguage.googleapis.com uchun
(x-goog-api-key sarlavhasi) saqlangan bo'lishi kerak: proksi uni o'zi qo'shadi.
Boshqa model kerak bo'lsa: GEMINI_IMAGE_MODEL=... python3 embassy/gen_images.py

Boshlovchilar yuzi ataylab ko'rsatilmaydi (orqadan yoki yondan): bu real suratlar emas,
PDF'da ular "Konsept-vizual" deb belgilanadi.
"""
import base64, io, json, os, sys, urllib.request
from PIL import Image

MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

STYLE = ("Realistic documentary travel-show photo, natural daylight, candid moment, 35mm lens, "
         "shallow depth of field, warm natural colours. The interviewer is seen only from behind or "
         "over the shoulder, face not visible, holding a handheld microphone. No text, no captions, "
         "no logos, no watermarks.")
SHOTS = {
    "interview-1": ("1:1", "On a university campus in New York City with brick buildings and autumn trees, "
                    "a smiling Central Asian female student in her early twenties answers interview questions "
                    "while a small camera crew films. " + STYLE),
    "interview-2": ("3:4", "Two Central Asian university students, a young man and a young woman, sit on stone "
                    "steps in downtown Chicago with skyscrapers behind them and talk to an interviewer. " + STYLE),
    "interview-3": ("3:4", "Three Central Asian university students stand on a palm-lined university campus "
                    "in Los Angeles on a sunny day and laugh while being interviewed. " + STYLE),
}


def generate(name, aspect, prompt):
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}},
    }
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), method="POST", headers={
        "Content-Type": "application/json",
        "x-goog-api-key": "set-by-proxy",  # haqiqiy kalitni proksi qo'yadi
    })
    with urllib.request.urlopen(req, timeout=180) as r:
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
    for name, (aspect, prompt) in SHOTS.items():
        if only and name not in only:
            continue
        print("ok", generate(name, aspect, prompt))
    print("Endi PDF'ni qayta yig'ing: node embassy/build.js")
