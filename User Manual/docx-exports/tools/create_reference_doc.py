from docx import Document
from docx.enum.text import WD_LINE_SPACING
from docx.shared import Inches, Pt


def configure_style(style, font_name, font_size_pt, before_pt, after_pt, line_spacing=1.15, bold=False):
    style.font.name = font_name
    style.font.size = Pt(font_size_pt)
    style.font.bold = bold
    pf = style.paragraph_format
    pf.space_before = Pt(before_pt)
    pf.space_after = Pt(after_pt)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = line_spacing


doc = Document()
section = doc.sections[0]
section.top_margin = Inches(0.9)
section.bottom_margin = Inches(0.9)
section.left_margin = Inches(0.9)
section.right_margin = Inches(0.9)

configure_style(doc.styles["Normal"], "Calibri", 11, 0, 6)
configure_style(doc.styles["List Paragraph"], "Calibri", 11, 0, 4)
configure_style(doc.styles["Heading 1"], "Calibri", 16, 18, 8, line_spacing=1.1, bold=True)
configure_style(doc.styles["Heading 2"], "Calibri", 14, 14, 6, line_spacing=1.1, bold=True)
configure_style(doc.styles["Heading 3"], "Calibri", 12, 12, 4, line_spacing=1.1, bold=True)

for toc_name in ("TOC 1", "TOC 2", "TOC 3"):
    if toc_name in doc.styles:
        configure_style(doc.styles[toc_name], "Calibri", 10.5, 0, 2, line_spacing=1.1)

# Keep this paragraph so template has body content and style defs are persisted.
doc.add_paragraph("Pandoc reference template for User Manual DOCX exports.")

out_path = r"User Manual\docx-exports\tools\reference-format.docx"
doc.save(out_path)
print(out_path)
