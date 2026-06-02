import os
import fitz  # مكتبة PyMuPDF للتعامل مع الـ PDF
from PIL import Image

def process_and_optimize(input_folder, output_folder, max_width=1200, quality=75):
    """
    دالة لتحويل ملفات PDF إلى صور، وضغط الصور العادية لتناسب الويب.
    """
    # إنشاء فولدر المخرجات لو مش موجود
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    valid_image_extensions = ('.jpg', '.jpeg', '.png', '.webp')

    for filename in os.listdir(input_folder):
        filepath = os.path.join(input_folder, filename)
        # فصل اسم الملف عن الصيغة
        name, ext = os.path.splitext(filename)
        ext = ext.lower()

        # ==========================================
        # لو الملف PDF
        # ==========================================
        if ext == '.pdf':
            try:
                # نفتح ملف الـ PDF
                doc = fitz.open(filepath)
                
                # نعدي على كل صفحة في الـ PDF
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    # تحويل الصفحة لصورة بـ DPI 150 (ممتاز جداً للويب)
                    pix = page.get_pixmap(dpi=150)
                    
                    # تحويل بيانات الصورة لمكتبة Pillow عشان نضغطها
                    mode = "RGBA" if pix.alpha else "RGB"
                    img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
                    
                    # تحديد اسم الصورة الجديدة (اسم الملف الأصلي + رقم الصفحة)
                    output_name = f"{name}_page_{page_num + 1}.jpg"
                    output_path = os.path.join(output_folder, output_name)
                    
                    # ضغط وحفظ الصورة
                    optimize_pil_image(img, output_path, max_width, quality)
                    
                print(f"✅ تم تحويل وضغط الـ PDF: {filename}")
                
            except Exception as e:
                print(f"❌ حصلت مشكلة في ملف {filename}: {e}")

        # ==========================================
        # لو الملف صورة عادية
        # ==========================================
        elif ext in valid_image_extensions:
            try:
                img = Image.open(filepath)
                output_path = os.path.join(output_folder, f"{name}.jpg")
                
                # ضغط وحفظ الصورة
                optimize_pil_image(img, output_path, max_width, quality)
                print(f"✅ تم ضغط الصورة: {filename}")
                
            except Exception as e:
                print(f"❌ حصلت مشكلة في صورة {filename}: {e}")

def optimize_pil_image(img, output_path, max_width, quality):
    """دالة مساعدة لتصغير الأبعاد وتقليل الحجم"""
    # لو عرض الصورة أكبر من العرض المسموح، نصغرها
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

    # تحويل الصورة لـ RGB علشان تدعم صيغة JPG (لو كانت PNG شفافة)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # حفظ الصورة بأفضل إعدادات ضغط للويب
    img.save(output_path, "JPEG", quality=quality, optimize=True)

# ==========================================
# طريقة الاستخدام
# ==========================================

# حط هنا مسار الفولدر اللي فيه الملفات الأصلية (صور أو PDF)
folder_in = "D:\\Python_env\\images2\\New folder" 

# حط هنا مسار الفولدر اللي هتتحفظ فيه الصور الجاهزة للويب
folder_out = "images" 

# تشغيل الكود
process_and_optimize(folder_in, folder_out)