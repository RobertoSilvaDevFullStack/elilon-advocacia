"""
Script de compressão de imagens para otimização de performance
Reduz drasticamente o tamanho das imagens mantendo qualidade visual aceitável
"""

from PIL import Image
import os
from pathlib import Path

# Configurações
INPUT_DIR = "public/images"
OUTPUT_DIR = "public/images_optimized"
MAX_WIDTH = 1920  # Largura máxima
MAX_HEIGHT = 1920  # Altura máxima
QUALITY = 80  # Qualidade JPEG (0-100)
WEBP_QUALITY = 75  # Qualidade WebP

def compress_image(input_path, output_path):
    """Comprime uma imagem"""
    try:
        # Abrir imagem
        with Image.open(input_path) as img:
            # Converter para RGB se necessário (para JPG)
            if img.mode in ('RGBA', 'P', 'LA'):
                # Criar fundo branco
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                if img.mode == 'RGBA' or img.mode == 'LA':
                    background.paste(img, mask=img.split()[-1])
                    img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Redimensionar se necessário
            width, height = img.size
            if width > MAX_WIDTH or height > MAX_HEIGHT:
                img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
                print(f"  Redimensionado de {width}x{height} para {img.size}")
            
            # Salvar imagem comprimida
            original_size = os.path.getsize(input_path)
            
            # Salvar como JPG otimizado
            if input_path.suffix.lower() in ['.jpg', '.jpeg']:
                img.save(output_path, 'JPEG', quality=QUALITY, optimize=True)
            # Salvar como PNG otimizado
            elif input_path.suffix.lower() == '.png':
                img.save(output_path, 'PNG', optimize=True)
            # Converter outros formatos para JPG
            else:
                output_path = output_path.with_suffix('.jpg')
                img.save(output_path, 'JPEG', quality=QUALITY, optimize=True)
            
            compressed_size = os.path.getsize(output_path)
            reduction = (1 - compressed_size / original_size) * 100
            
            print(f"  Original: {original_size / 1024:.1f} KB")
            print(f"  Comprimido: {compressed_size / 1024:.1f} KB")
            print(f"  Redução: {reduction:.1f}%")
            
            # Criar também versão WebP
            webp_path = output_path.with_suffix('.webp')
            img.save(webp_path, 'WEBP', quality=WEBP_QUALITY, method=6)
            webp_size = os.path.getsize(webp_path)
            print(f"  WebP: {webp_size / 1024:.1f} KB")
            
            return True
    except Exception as e:
        print(f"  ERRO: {e}")
        return False

def main():
    """Função principal"""
    input_dir = Path(INPUT_DIR)
    output_dir = Path(OUTPUT_DIR)
    
    # Criar diretório de saída
    output_dir.mkdir(exist_ok=True)
    
    print("=" * 60)
    print("COMPRESSÃO DE IMAGENS - Otimização de Performance")
    print("=" * 60)
    print(f"Qualidade JPG: {QUALITY}")
    print(f"Qualidade WebP: {WEBP_QUALITY}")
    print(f"Dimensões máximas: {MAX_WIDTH}x{MAX_HEIGHT}")
    print("=" * 60)
    print()
    
    # Extensões suportadas
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    
    # Processar todas as imagens
    total_original = 0
    total_compressed = 0
    count = 0
    
    for image_path in input_dir.iterdir():
        if image_path.suffix.lower() in image_extensions and image_path.is_file():
            print(f"Processando: {image_path.name}")
            
            output_path = output_dir / image_path.name
            
            original_size = os.path.getsize(image_path)
            total_original += original_size
            
            if compress_image(image_path, output_path):
                count += 1
                total_compressed += os.path.getsize(output_path)
            
            print()
    
    # Resumo
    print("=" * 60)
    print(f"RESUMO - {count} imagens processadas")
    print("=" * 60)
    print(f"Tamanho original total: {total_original / 1024 / 1024:.2f} MB")
    print(f"Tamanho comprimido total: {total_compressed / 1024 / 1024:.2f} MB")
    if total_original > 0:
        reduction = (1 - total_compressed / total_original) * 100
        print(f"Redução total: {reduction:.1f}%")
    print()
    print(f"Imagens otimizadas salvas em: {output_dir}")
    print()
    print("PRÓXIMOS PASSOS:")
    print("1. Verifique as imagens em 'public/images_optimized'")
    print("2. Se estiverem boas, substitua as originais:")
    print(f"   - Faça backup de '{INPUT_DIR}'")
    print(f"   - Copie conteúdo de '{OUTPUT_DIR}' para '{INPUT_DIR}'")
    print("3. Faça novo build: npm run build")

if __name__ == "__main__":
    # Verificar se PIL está instalado
    try:
        from PIL import Image
        main()
    except ImportError:
        print("ERRO: Pillow não está instalado!")
        print("Instale com: pip install Pillow")
