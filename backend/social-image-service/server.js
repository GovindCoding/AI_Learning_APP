import express from 'express';
import cors from 'cors';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8084;

app.use(cors());
app.use(express.json());

// Helper for wrapping text in SVG
function wrapText(text, maxCharsPerLine) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Helper to escape XML/SVG special characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Health check endpoint
app.get('/api/v1/image/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Social Image Renderer Service' });
});

// Render image endpoint
app.post('/api/v1/image/render', async (req, res) => {
  try {
    const {
      bannerSize = 'linkedin',
      bannerBg = 'gradient',
      bannerTitle = 'AI Update',
      bannerSummary = 'Explore the latest in generative AI ecosystems.',
      bannerTag = 'AI Ecosystem',
      bannerDate = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      bannerAuthor = '@ailearner',
      bannerLogo = 'AI TRACKER',
      brandColors = '#0284c7,#6366f1',
      borderRadius = 12,
      format = 'png'
    } = req.body;

    // Define dimensions
    let width = 1200;
    let height = 628;

    if (bannerSize === 'twitter') {
      width = 1200;
      height = 675;
    } else if (bannerSize === 'instagram') {
      width = 1080;
      height = 1080;
    } else if (bannerSize === 'story') {
      width = 1080;
      height = 1920;
    } else if (bannerSize === 'linkedin-portrait') {
      width = 1080;
      height = 1350;
    } else if (bannerSize === 'linkedin-square') {
      width = 1200;
      height = 1200;
    }

    // Parse brand colors
    const colors = brandColors.split(',');
    const primaryColor = colors[0] || '#0284c7';
    const secondaryColor = colors[1] || '#6366f1';

    // Wrap text based on width and font sizes
    // Horizontal space available is roughly width * 0.84
    const textWidth = width * 0.84;
    // Estimated char width at title (44px) is ~22px
    const maxTitleChars = Math.floor(textWidth / 22);
    // Estimated char width at subtitle (20px) is ~10px
    const maxSubtextChars = Math.floor(textWidth / 10);

    const titleLines = wrapText(bannerTitle, maxTitleChars).slice(0, 3).map(escapeXml);
    const summaryLines = wrapText(bannerSummary, maxSubtextChars).slice(0, 5).map(escapeXml);

    const escapedTag = escapeXml(bannerTag);
    const escapedAuthor = escapeXml(bannerAuthor);
    const escapedLogo = escapeXml(bannerLogo);
    const escapedDate = escapeXml(bannerDate);

    // Build SVG components based on template
    let bgSvg = '';
    let styleTag = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@700;800;900&amp;family=JetBrains+Mono:wght@500&amp;display=swap');
      .title { font-family: 'Outfit', 'Segoe UI', -apple-system, sans-serif; font-weight: 800; }
      .body { font-family: 'Inter', 'Segoe UI', -apple-system, sans-serif; font-weight: 400; }
      .tag { font-family: 'Outfit', 'Segoe UI', -apple-system, sans-serif; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
      .meta { font-family: 'Inter', 'Segoe UI', -apple-system, sans-serif; font-weight: 500; font-size: 14px; }
      .logo { font-family: 'Outfit', 'Segoe UI', -apple-system, sans-serif; font-weight: 800; font-size: 16px; letter-spacing: 0.5px; }
      .mono { font-family: 'JetBrains Mono', 'Consolas', monospace; font-size: 11px; }
    `;

    const tagX = width * 0.08;
    const tagY = height * 0.15;
    const titleYStart = tagY + 50;

    let isDarkBg = true;

    // Build template content
    if (bannerBg === 'gradient' || bannerBg === 'Modern AI') {
      bgSvg = `
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0b1329" />
            <stop offset="50%" stop-color="#111827" />
            <stop offset="100%" stop-color="#030712" />
          </linearGradient>
          <radialGradient id="orbPrimary" cx="80%" cy="20%" r="50%">
            <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="orbSecondary" cx="20%" cy="80%" r="50%">
            <stop offset="0%" stop-color="${secondaryColor}" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
        <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${Math.max(width, height) * 0.5}" fill="url(#orbPrimary)" />
        <circle cx="${width * 0.2}" cy="${height * 0.8}" r="${Math.max(width, height) * 0.5}" fill="url(#orbSecondary)" />
        
        <!-- Decorative grid overlay -->
        <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" stroke-width="1" />
        </pattern>
        <rect width="${width}" height="${height}" fill="url(#gridPattern)" />
      `;
    } else if (bannerBg === 'grid' || bannerBg === 'Futuristic Neon') {
      bgSvg = `
        <defs>
          <linearGradient id="glowBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${primaryColor}" />
            <stop offset="100%" stop-color="${secondaryColor}" />
          </linearGradient>
          <filter id="neonFilter">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="${width}" height="${height}" fill="#050508" />
        
        <!-- Grid lines -->
        <pattern id="cyberGrid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="${primaryColor}" stroke-opacity="0.04" stroke-width="1" />
        </pattern>
        <rect width="${width}" height="${height}" fill="url(#cyberGrid)" />
        
        <!-- Glowing neon border frame -->
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="${borderRadius}" fill="none" stroke="url(#glowBorder)" stroke-width="2" stroke-opacity="0.6" filter="url(#neonFilter)" />
      `;
    } else if (bannerBg === 'slate' || bannerBg === 'Corporate AI') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#0f172a" />
        <rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="${borderRadius}" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
        <!-- Tech corners -->
        <path d="M 25 45 L 25 25 L 45 25" fill="none" stroke="${primaryColor}" stroke-width="3" />
        <path d="M ${width - 25} 45 L ${width - 25} 25 L ${width - 45} 25" fill="none" stroke="${primaryColor}" stroke-width="3" />
        <path d="M 25 ${height - 45} L 25 ${height - 25} L 45 ${height - 25}" fill="none" stroke="${primaryColor}" stroke-width="3" />
        <path d="M ${width - 25} ${height - 45} L ${width - 25} ${height - 25} L ${width - 45} ${height - 25}" fill="none" stroke="${primaryColor}" stroke-width="3" />
      `;
    } else if (bannerBg === 'glass' || bannerBg === 'Glassmorphism') {
      bgSvg = `
        <defs>
          <linearGradient id="glassBackdrop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="50%" stop-color="#818cf8" />
            <stop offset="100%" stop-color="#ec4899" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#glassBackdrop)" />
        
        <!-- Large frosted glass overlay -->
        <rect x="${width * 0.05}" y="${height * 0.08}" width="${width * 0.9}" height="${height * 0.84}" rx="${borderRadius + 8}" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1.5" />
        <!-- Soft decorative circles inside -->
        <circle cx="${width * 0.88}" cy="${height * 0.2}" r="60" fill="rgba(255, 255, 255, 0.08)" />
        <circle cx="${width * 0.12}" cy="${height * 0.8}" r="40" fill="rgba(255, 255, 255, 0.08)" />
      `;
    } else if (bannerBg === 'Minimal Dark') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#121212" />
        <!-- Minimal border -->
        <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
      `;
    } else if (bannerBg === 'Gradient Pro') {
      bgSvg = `
        <defs>
          <linearGradient id="gradientProBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d946ef" />
            <stop offset="30%" stop-color="#8b5cf6" />
            <stop offset="70%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#06b6d4" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#gradientProBg)" />
        <!-- Inner card overlay -->
        <rect x="${width * 0.05}" y="${height * 0.08}" width="${width * 0.9}" height="${height * 0.84}" rx="${borderRadius}" fill="#0f172a" fill-opacity="0.88" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1" />
      `;
    } else if (bannerBg === 'Tech News Style') {
      isDarkBg = false;
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#f8fafc" />
        <!-- Left boundary card accent strip -->
        <rect x="0" y="0" width="15" height="${height}" fill="${primaryColor}" />
        <!-- Top border line -->
        <line x1="0" y1="40" x2="${width}" y2="40" stroke="rgba(15, 23, 42, 0.06)" stroke-width="1" />
      `;
    } else if (bannerBg === 'AI Infographic') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#18181b" />
        <!-- Box layout divisions -->
        <rect x="${tagX}" y="${height * 0.52}" width="${width * 0.84}" height="${height * 0.22}" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
        <rect x="${tagX + 15}" y="${height * 0.52 - 10}" width="140" height="20" rx="4" fill="${primaryColor}" />
      `;
    } else if (bannerBg === 'Startup Founder Style') {
      bgSvg = `
        <defs>
          <linearGradient id="founderBg" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#founderBg)" />
        <!-- Soft decorative quote graphic -->
        <path d="M 70 200 C 70 170 90 150 110 150 C 120 150 130 160 130 170 C 130 190 110 200 110 210 C 110 230 120 240 130 250 C 120 270 90 270 70 240 C 60 225 60 210 70 200 Z M 150 200 C 150 170 170 150 190 150 C 200 150 210 160 210 170 C 210 190 190 200 190 210 C 190 230 200 240 210 250 C 200 270 170 270 150 240 C 140 225 140 210 150 200 Z" fill="rgba(255, 255, 255, 0.03)" />
      `;
    }

    // Color text tags based on dark/light mode
    const textThemeColor = isDarkBg ? '#ffffff' : '#0f172a';
    const subtextThemeColor = isDarkBg ? '#94a3b8' : '#475569';
    const dividerColor = isDarkBg ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';

    // Tag capsule styles
    let tagBadgeSvg = '';
    if (bannerBg === 'Minimal Dark') {
      tagBadgeSvg = `<text x="${tagX}" y="${tagY + 12}" fill="${secondaryColor}" class="mono font-bold" font-size="12">[ ${escapedTag.toUpperCase()} ]</text>`;
    } else {
      const capsuleBg = isDarkBg ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)';
      // Programmatic estimate width for rendering clean capsule
      const estimatedCapsuleWidth = bannerTag.length * 7.5 + 24;
      tagBadgeSvg = `
        <rect x="${tagX}" y="${tagY}" width="${estimatedCapsuleWidth}" height="28" rx="6" fill="${capsuleBg}" stroke="${secondaryColor}" stroke-opacity="0.25" stroke-width="1" />
        <text x="${tagX + 12}" y="${tagY + 18}" fill="${secondaryColor}" class="tag" font-size="11" font-weight="800">${escapedTag.toUpperCase()}</text>
      `;
    }

    // Assemble text lines SVGs
    let titleLinesSvg = '';
    let currentY = titleYStart;
    const titleLineHeight = 46;

    titleLines.forEach((line) => {
      titleLinesSvg += `<text x="${tagX}" y="${currentY}" fill="${textThemeColor}" class="title" font-size="36">${line}</text>\n`;
      currentY += titleLineHeight;
    });

    // Subtitle rendering y-offset based on title height
    let subtextYStart = currentY + 15;
    if (titleLines.length === 1) {
      subtextYStart = titleYStart + 55;
    }

    let summaryLinesSvg = '';
    const summaryLineHeight = 26;
    currentY = subtextYStart;

    summaryLines.forEach((line) => {
      summaryLinesSvg += `<text x="${tagX}" y="${currentY}" fill="${subtextThemeColor}" class="body" font-size="18">${line}</text>\n`;
      currentY += summaryLineHeight;
    });

    // Infographic key takeaway header decoration
    let infographicDecorator = '';
    if (bannerBg === 'AI Infographic') {
      infographicDecorator = `
        <text x="${tagX + 25}" y="${height * 0.52 + 5}" fill="#ffffff" class="tag" font-size="10" font-weight="900">KEY TAKEAWAY</text>
      `;
    }

    // Assemble Footer elements
    const footerLineY = height * 0.8;
    const footerTextY = height * 0.84 + 10;

    const footerSvg = `
      <!-- Footer divider line -->
      <line x1="${tagX}" y1="${footerLineY}" x2="${width * 0.92}" y2="${footerLineY}" stroke="${dividerColor}" stroke-width="1" />
      
      <!-- Date -->
      <text x="${tagX}" y="${footerTextY}" fill="${subtextThemeColor}" class="meta">${escapedDate}</text>
      
      <!-- Author signature -->
      <text x="${tagX + 160}" y="${footerTextY}" fill="${primaryColor}" class="meta" font-weight="700">${escapedAuthor}</text>
      
      <!-- Logo Branding aligned right -->
      <text x="${width * 0.92}" y="${footerTextY}" fill="${textThemeColor}" class="logo" text-anchor="end">${escapedLogo}</text>
      <!-- Accent indicator circle -->
      <circle cx="${width * 0.92 - (bannerLogo.length * 8.5) - 20}" cy="${footerTextY - 6}" r="6" fill="${primaryColor}" />
    `;

    // Construct final SVG code
    const svgCode = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          ${styleTag}
        </style>
        ${bgSvg}
        ${tagBadgeSvg}
        ${titleLinesSvg}
        ${summaryLinesSvg}
        ${infographicDecorator}
        ${footerSvg}
      </svg>
    `;

    // Generate output format using Sharp
    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.status(200).send(svgCode);
    }

    const svgBuffer = Buffer.from(svgCode);
    let outputBuffer;

    if (format === 'jpg' || format === 'jpeg') {
      outputBuffer = await sharp(svgBuffer)
        .jpeg({ quality: 95 })
        .toBuffer();
      res.setHeader('Content-Type', 'image/jpeg');
    } else {
      // Default to PNG high quality
      outputBuffer = await sharp(svgBuffer)
        .png({ compressionLevel: 8 })
        .toBuffer();
      res.setHeader('Content-Type', 'image/png');
    }

    return res.status(200).send(outputBuffer);
  } catch (error) {
    console.error('Error rendering image:', error);
    return res.status(500).json({ error: 'Failed to render high-res image', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Social Image Renderer Service running on port ${PORT}`);
});
