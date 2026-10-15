import os
import zipfile

def zip_ci4():
    ci4_folder = 'codeigniter4-klinik-hapud'
    zip_path_1 = 'public/Klinik_H.APUD_CodeIgniter4.zip'
    zip_path_2 = 'public/Klinik_H.APUD.zip'
    
    root_folder_name = 'Klinik_H.APUD_CodeIgniter4'

    for zip_path in [zip_path_1, zip_path_2]:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(ci4_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, ci4_folder)
                    arcname = os.path.join(root_folder_name, rel_path)
                    zipf.write(file_path, arcname)
        print(f"Successfully created {zip_path} ({os.path.getsize(zip_path)} bytes)")

if __name__ == '__main__':
    zip_ci4()
