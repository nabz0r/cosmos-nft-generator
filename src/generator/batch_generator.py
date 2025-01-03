import os
from planet_generator import PlanetGenerator
from metadata_generator import MetadataGenerator
from PIL import Image
import concurrent.futures
import requests

class BatchGenerator:
    def __init__(self, output_dir="output", ipfs_url="https://ipfs.io/ipfs/"):
        self.output_dir = output_dir
        self.ipfs_url = ipfs_url
        self.planet_generator = PlanetGenerator()
        self.metadata_generator = MetadataGenerator()
        
        # Créer les dossiers nécessaires
        os.makedirs(os.path.join(output_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "metadata"), exist_ok=True)

    def generate_single(self, token_id):
        """Génère une planète et ses métadonnées"""
        # Générer l'image
        image_path = os.path.join(self.output_dir, "images", f"{token_id}.png")
        self.planet_generator.save_planet(image_path)
        
        # Upload vers IPFS (simulation pour l'instant)
        image_ipfs_hash = self._upload_to_ipfs(image_path)
        image_url = f"{self.ipfs_url}{image_ipfs_hash}"
        
        # Générer et sauvegarder les métadonnées
        metadata_path = os.path.join(self.output_dir, "metadata", f"{token_id}.json")
        self.metadata_generator.save_metadata(token_id, image_url, metadata_path)
        
        return image_url

    def generate_batch(self, start_id, count, max_workers=4):
        """Génère un lot de NFTs en parallèle"""
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_id = {
                executor.submit(self.generate_single, token_id): token_id
                for token_id in range(start_id, start_id + count)
            }
            
            results = []
            for future in concurrent.futures.as_completed(future_to_id):
                token_id = future_to_id[future]
                try:
                    image_url = future.result()
                    results.append({
                        "token_id": token_id,
                        "image_url": image_url
                    })
                except Exception as e:
                    print(f"Error generating NFT {token_id}: {e}")
        
        return results

    def _upload_to_ipfs(self, file_path):
        """
        Simule l'upload vers IPFS
        À remplacer par une vraie implémentation IPFS
        """
        # Ici nous simulons un hash IPFS
        return f"Qm...{os.path.basename(file_path)}"