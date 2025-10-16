from PIL import Image, ImageDraw
import os

def create_icon(size):
    """Create a modern shield icon with gradient background"""
    # Create image with gradient background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background (purple to pink)
    for y in range(size):
        # Calculate color gradient
        ratio = y / size
        r = int(99 + (236 - 99) * ratio)
        g = int(102 + (72 - 102) * ratio)
        b = int(241 + (153 - 241) * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    
    # Draw shield shape
    center_x = size // 2
    center_y = size // 2
    shield_size = int(size * 0.6)
    
    # Shield points
    top = center_y - int(shield_size * 0.4)
    bottom = center_y + int(shield_size * 0.5)
    left = center_x - int(shield_size * 0.35)
    right = center_x + int(shield_size * 0.35)
    
    # Create shield polygon
    shield_points = [
        (center_x, top),
        (right, top + int(shield_size * 0.15)),
        (right, center_y + int(shield_size * 0.1)),
        (center_x, bottom),
        (left, center_y + int(shield_size * 0.1)),
        (left, top + int(shield_size * 0.15))
    ]
    
    # Draw white shield
    draw.polygon(shield_points, fill=(255, 255, 255, 240))
    
    # Add checkmark for larger sizes
    if size >= 48:
        line_width = max(2, size // 16)
        check_color = (99, 102, 241, 255)  # Purple
        
        # Checkmark points
        p1 = (center_x - int(shield_size * 0.15), center_y)
        p2 = (center_x - int(shield_size * 0.05), center_y + int(shield_size * 0.15))
        p3 = (center_x + int(shield_size * 0.2), center_y - int(shield_size * 0.15))
        
        # Draw checkmark
        draw.line([p1, p2], fill=check_color, width=line_width)
        draw.line([p2, p3], fill=check_color, width=line_width)
    
    return img

def main():
    """Generate all icon sizes"""
    sizes = [16, 48, 128]
    
    for size in sizes:
        print(f"Generating icon{size}.png...")
        icon = create_icon(size)
        icon.save(f'icon{size}.png', 'PNG')
        print(f"✅ Generated icon{size}.png")
    
    print("🎉 All icons generated successfully!")

if __name__ == "__main__":
    main()
