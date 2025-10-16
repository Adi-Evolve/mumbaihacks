const fs = require('fs');
const { createCanvas } = require('canvas');

function drawIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background - Soft gradient (simulate with solid color for simplicity)
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Shield shape - Modern minimal
    const centerX = size / 2;
    const centerY = size / 2;
    const shieldSize = size * 0.6;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    
    // Draw shield
    const top = centerY - shieldSize * 0.4;
    const bottom = centerY + shieldSize * 0.5;
    const left = centerX - shieldSize * 0.35;
    const right = centerX + shieldSize * 0.35;
    
    ctx.moveTo(centerX, top);
    ctx.lineTo(right, top + shieldSize * 0.15);
    ctx.lineTo(right, centerY + shieldSize * 0.1);
    ctx.quadraticCurveTo(right, bottom - shieldSize * 0.2, centerX, bottom);
    ctx.quadraticCurveTo(left, bottom - shieldSize * 0.2, left, centerY + shieldSize * 0.1);
    ctx.lineTo(left, top + shieldSize * 0.15);
    ctx.closePath();
    ctx.fill();
    
    // Add checkmark (if size is large enough)
    if (size >= 48) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = size / 16;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(centerX - shieldSize * 0.15, centerY);
        ctx.lineTo(centerX - shieldSize * 0.05, centerY + shieldSize * 0.15);
        ctx.lineTo(centerX + shieldSize * 0.2, centerY - shieldSize * 0.15);
        ctx.stroke();
    }
    
    return canvas;
}

// Generate icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
    const canvas = drawIcon(size);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon${size}.png`, buffer);
    console.log(`✅ Generated icon${size}.png`);
});

console.log('🎉 All icons generated successfully!');
