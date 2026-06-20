import os
import glob
from rembg import remove

def process_images():
    icons_dir = r"C:\Ricardo\stop\public\aviso"
    output_dir = r"C:\Ricardo\stop\public\aviso\transparent"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    images = glob.glob(os.path.join(icons_dir, "*.png"))
    print(f"Encontradas {len(images)} imagens. Removendo fundos...")
    
    for img_path in images:
        filename = os.path.basename(img_path)
        out_path = os.path.join(output_dir, filename)
        
        print(f"Processando {filename}...")
        try:
            with open(img_path, 'rb') as i:
                input_data = i.read()
                
            # A IA do rembg remove o fundo da imagem
            output_data = remove(input_data)
            
            with open(out_path, 'wb') as o:
                o.write(output_data)
        except Exception as e:
            print(f"Erro no arquivo {filename}: {e}")

    print("\nConcluído! As imagens prontas estão na pasta 'public/icons/transparent'.")
    print("Você pode revisar as imagens e depois substituir as originais.")

if __name__ == "__main__":
    process_images()
