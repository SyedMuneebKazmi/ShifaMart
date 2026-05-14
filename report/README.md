# ShifaMart+ AI Agent - LaTeX Report

This directory contains the LaTeX source files for the Final Year Project report.

## File Structure

```
report/
├── main.tex              # Main LaTeX document
├── sections/
│   ├── chapter1.tex      # Introduction
│   ├── chapter2.tex      # Literature Review
│   ├── chapter3.tex      # System Design and Implementation
│   └── chapter4.tex      # Results and Discussion
├── bib.bib               # Bibliography references
├── appendix.tex          # Appendix
└── README.md             # This file
```

## Requirements

To compile this LaTeX document, you need:

1. **LaTeX Distribution**: 
   - Windows: MiKTeX or TeX Live
   - Mac: MacTeX
   - Linux: TeX Live

2. **Required LaTeX Packages**:
   - `fast-nuces-bs` (FAST-NUCES thesis class file)
   - `graphicx` (for images)
   - `listings` (for code blocks)
   - `hyperref` (for hyperlinks)
   - `amsmath` (for mathematical equations)
   - And other standard packages

3. **Thesis Class File**: 
   - You need the `fast-nuces-bs.cls` file in your LaTeX distribution path or in the same directory

## Compilation Instructions

### Using Overleaf (Recommended)

1. Go to [Overleaf](https://www.overleaf.com)
2. Create a new project
3. Upload all files from the `report/` directory
4. Upload the `fast-nuces-bs.cls` class file
5. Set `main.tex` as the main document
6. Click "Compile"

### Using Local LaTeX Installation

#### Windows (MiKTeX/TeX Live)

```bash
# Navigate to report directory
cd report

# Compile PDF (run multiple times for references)
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

#### Mac/Linux (TeX Live)

```bash
# Navigate to report directory
cd report

# Compile PDF
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

## Customization

### Update Project Information

Edit the following section in `main.tex`:

```latex
\department{Department of Computer Science}
\faculty{Computer Science}
\degreeyear{2024}
\degreemonth{June}
\degreename{Computer Science}
\campuscity{Islamabad}

\authorone{Student 1}{19I-1234}
\authortwo{Student 2}{19I-1234}
\authorthree{Student 3}{19I-1234}

\supervisor{Mr./ Ms./ Dr. Supervisor Name}
\sessionduration{2020-2024}
```

### Add Images

Place images in the `report/` directory and include them using:

```latex
\begin{figure}[H]
    \centering
    \includegraphics[width=0.8\textwidth]{image_name.png}
    \caption{Image Caption}
    \label{fig:image_label}
\end{figure}
```

### Add Code Listings

Code listings are already configured. Use:

```latex
\begin{lstlisting}[language=Python, caption=Code Caption]
# Your code here
\end{lstlisting}
```

## Notes

1. **Class File**: Make sure you have the `fast-nuces-bs.cls` file. If not available, you can temporarily use `\documentclass{article}` (commented in main.tex) for testing.

2. **Bibliography**: The bibliography file (`bib.bib`) contains sample references. Add your own references as needed.

3. **Compilation**: You may need to compile multiple times to resolve all cross-references and citations.

4. **Images**: Add any figures/diagrams you want to include in the report.

## Troubleshooting

### Missing Class File Error
- Ensure `fast-nuces-bs.cls` is in the same directory or in your LaTeX path
- Or use the commented `\documentclass{article}` line for testing

### Bibliography Not Showing
- Run `bibtex main` after the first `pdflatex` compilation
- Then run `pdflatex` two more times

### Code Listings Not Working
- Ensure the `listings` package is installed
- Check that language names are correct (Python, bash, etc.)

## Contact

For issues or questions about the report, contact your supervisor or FYP coordinator.
