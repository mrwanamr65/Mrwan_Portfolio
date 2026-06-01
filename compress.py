import os
from PIL import Image

def optimize_images(input_folder, output_folder, max_width=1200, quality=75):
    """
    دالة لتصغير وضغط الصور لتناسب الويب.
    max_width: أقصى عرض للصورة (لو أكبر من كده هتتصغر مع الحفاظ على الأبعاد).
    quality: جودة الصورة بعد الضغط (من 1 لـ 100، 75 رقم ممتاز للويب).
    """
    
    # لو فولدر الصور الجديدة مش موجود، الكود هيعمله
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # الصيغ اللي الكود هيتعامل معاها
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')

    # نعدي على كل الملفات اللي في الفولدر
    for filename in os.listdir(input_folder):
        ext = os.path.splitext(filename)[1].lower()
        
        # نتأكد إن الملف عبارة عن صورة
        if ext in valid_extensions:
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)

            try:
                # نفتح الصورة
                img = Image.open(input_path)

                # لو عرض الصورة أكبر من العرض المسموح، نصغرها
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

                # لو الصورة PNG شفافة وعايزين نحولها لـ JPG علشان نقلل الحجم اكتر
                if img.mode in ("RGBA", "P") and ext in ('.jpg', '.jpeg'):
                    img = img.convert("RGB")

                # نحفظ الصورة بالإعدادات الجديدة
                img.save(output_path, quality=quality, optimize=True)
                print(f"✅ تم ضغط وحفظ: {filename}")

            except Exception as e:
                print(f"❌ حصلت مشكلة في صورة {filename}: {e}")

# ==========================================
# طريقة الاستخدام:
# ==========================================

# حط هنا مسار الفولدر اللي فيه الصور الأصلية
folder_in = "images2" 

# حط هنا مسار الفولدر اللي هتتحفظ فيه الصور بعد الضغط
folder_out = "images" 

# تشغيل الكود
optimize_images(folder_in, folder_out)