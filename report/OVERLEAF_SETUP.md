# Overleaf Setup Instructions

## File Structure for Overleaf

Upload the following structure to Overleaf:

```
project/
├── report.tex          (Main LaTeX file - all content in one file)
└── images/
    └── 1.png           (Cover page image)
```

## Steps to Upload

1. **Create New Project** in Overleaf
2. **Upload report.tex** as the main file
3. **Create folder** named `images` in Overleaf
4. **Upload 1.png** into the `images` folder
5. **Set report.tex as main document** (if not automatically detected)
6. **Compile** the document

## Image Requirements

- **File name**: `1.png`
- **Location**: `images/1.png` (relative to report.tex)
- **Recommended size**: 1200x1600 pixels or similar aspect ratio
- **Format**: PNG, JPG, or PDF

## Compilation

The document should compile successfully with:
- All content in single `report.tex` file
- Cover image from `images/1.png`
- All diagrams generated using TikZ (no external image dependencies)

## Notes

- The `fast-nuces-bs.cls` class file should be available in your LaTeX distribution or uploaded to Overleaf
- If the class file is not available, you can temporarily uncomment `\documentclass{article}` for testing
- All diagrams are created using TikZ, so they will render correctly in PDF
