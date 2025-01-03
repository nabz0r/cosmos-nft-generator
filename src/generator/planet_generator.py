import random
from PIL import Image, ImageDraw

class PlanetGenerator:
    def __init__(self, size=64):
        self.size = size
        self.colors = {
            'space': (0, 0, 20),  # Dark space background
            'planets': [
                [(200, 100, 50), (255, 150, 100)],  # Rocky/Desert planets
                [(50, 100, 200), (100, 150, 255)],  # Ice/Ocean planets
                [(50, 150, 50), (100, 200, 100)],   # Forest planets
                [(150, 50, 150), (200, 100, 200)],  # Gas giants
            ]
        }

    def generate_base_circle(self, image, center, radius, color):
        draw = ImageDraw.Draw(image)
        bbox = (
            center[0] - radius,
            center[1] - radius,
            center[0] + radius,
            center[1] + radius
        )
        draw.ellipse(bbox, fill=color)
        return image

    def add_surface_details(self, image, planet_type):
        pixels = image.load()
        base_color = self.colors['planets'][planet_type][0]
        detail_color = self.colors['planets'][planet_type][1]
        
        for x in range(self.size):
            for y in range(self.size):
                if pixels[x, y] != self.colors['space']:
                    if random.random() < 0.3:  # 30% chance of detail
                        noise = random.randint(-20, 20)
                        pixels[x, y] = tuple(
                            max(0, min(255, c + noise))
                            for c in detail_color
                        )

    def generate_stars(self, image):
        draw = ImageDraw.Draw(image)
        num_stars = random.randint(10, 20)
        
        for _ in range(num_stars):
            x = random.randint(0, self.size-1)
            y = random.randint(0, self.size-1)
            brightness = random.randint(150, 255)
            draw.point((x, y), fill=(brightness, brightness, brightness))

    def generate(self):
        # Create base image with space background
        image = Image.new('RGB', (self.size, self.size), self.colors['space'])
        
        # Add stars
        self.generate_stars(image)
        
        # Generate planet
        planet_type = random.randint(0, len(self.colors['planets']) - 1)
        planet_radius = random.randint(self.size//4, self.size//3)
        center = (self.size//2, self.size//2)
        
        # Create base planet
        self.generate_base_circle(
            image, 
            center, 
            planet_radius, 
            self.colors['planets'][planet_type][0]
        )
        
        # Add surface details
        self.add_surface_details(image, planet_type)
        
        return image

    def save_planet(self, filename="planet.png"):
        planet = self.generate()
        planet.save(filename)
        return filename

if __name__ == "__main__":
    # Test generation
    generator = PlanetGenerator(64)
    generator.save_planet("test_planet.png")