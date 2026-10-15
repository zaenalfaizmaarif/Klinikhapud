import os
import zipfile

def make_zip():
    os.makedirs('public', exist_ok=True)
    zip_path = os.path.join('public', 'Klinik_H.APUD.zip')
    
    # Root folder name inside zip
    root_folder = 'Klinik_H.APUD'
    
    exclude_dirs = {'.git', 'node_modules', 'dist', '.aistudio', '__pycache__'}
    exclude_files = {'bun.lock', 'Klinik_H.APUD.zip'}
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Prune excluded directories (keep .vscode)
            dirs[:] = [d for d in dirs if d not in exclude_dirs and (not d.startswith('.') or d == '.vscode')]
            
            for file in files:
                if file in exclude_files or file.endswith('.pyc'):
                    continue
                if file.startswith('.') and file not in {'.env.example', '.gitignore'} and not root.startswith('./.vscode'):
                    continue
                if root == './public' and file.endswith('.zip'):
                    continue
                
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, '.')
                arcname = os.path.join(root_folder, rel_path)
                zipf.write(file_path, arcname)
                print(f"Added: {arcname}")

    print(f"\nSuccessfully created {zip_path} ({os.path.getsize(zip_path)} bytes)")

if __name__ == '__main__':
    make_zip()
