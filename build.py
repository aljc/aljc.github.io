import re
from pathlib import Path

# Configuration
NOTES_DIR = 'notes'
OUTPUT_DIR = 'notes'
TEMPLATE_FILE = 'note_template.html'

def get_template():
    with open(TEMPLATE_FILE, 'r') as f:
        return f.read()

def parse_metadata(md_content):
    """Extract title from first # heading"""
    metadata = {}
    title_match = re.search(r'^# (.*?)$', md_content, re.MULTILINE)
    if title_match:
        metadata['title'] = title_match.group(1)
    else:
        metadata['title'] = "Untitled Note"
    return metadata

def simple_markdown_to_html(md_content):
    """
    Simple markdown converter for basic formatting.
    Handles: headers, paragraphs, lists, bold, italic, links, and passes through HTML.
    """
    lines = md_content.split('\n')
    html_lines = []
    in_list = False
    in_ordered_list = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Skip empty lines but close lists if needed
        if not line.strip():
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_ordered_list:
                html_lines.append('</ol>')
                in_ordered_list = False
            html_lines.append('')
            i += 1
            continue
        
        # Pass through HTML (lines starting with <)
        if line.strip().startswith('<'):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_ordered_list:
                html_lines.append('</ol>')
                in_ordered_list = False
            html_lines.append(line)
            i += 1
            continue
        
        # Headers
        if line.startswith('# '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_ordered_list:
                html_lines.append('</ol>')
                in_ordered_list = False
            html_lines.append(f'<h1>{line[2:]}</h1>')
            i += 1
            continue
        elif line.startswith('## '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_ordered_list:
                html_lines.append('</ol>')
                in_ordered_list = False
            html_lines.append(f'<h2>{line[3:]}</h2>')
            i += 1
            continue
        elif line.startswith('### '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_ordered_list:
                html_lines.append('</ol>')
                in_ordered_list = False
            html_lines.append(f'<h3>{line[4:]}</h3>')
            i += 1
            continue
        
        # Unordered lists
        if line.startswith('- '):
            if in_ordered_list:
                html_lines.append('</ol>')
                in_ordered_list = False
            if not in_list:
                html_lines.append('<ul>')
                in_list = True
            html_lines.append(f'<li>{process_inline(line[2:])}</li>')
            i += 1
            continue
        
        # Ordered lists (1. 2. etc.)
        if re.match(r'^\d+\.\s', line):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if not in_ordered_list:
                html_lines.append('<ol>')
                in_ordered_list = True
            content = re.sub(r'^\d+\.\s', '', line)
            html_lines.append(f'<li>{process_inline(content)}</li>')
            i += 1
            continue
        
        # Regular paragraph
        if in_list:
            html_lines.append('</ul>')
            in_list = False
        if in_ordered_list:
            html_lines.append('</ol>')
            in_ordered_list = False
        html_lines.append(f'<p>{process_inline(line)}</p>')
        i += 1
    
    # Close any open lists
    if in_list:
        html_lines.append('</ul>')
    if in_ordered_list:
        html_lines.append('</ol>')
    
    return '\n'.join(html_lines)

def process_inline(text):
    """Process inline markdown: bold, italic, links"""
    # Links [text](url)
    text = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', r'<a href="\2">\1</a>', text)
    # Bold **text**
    text = re.sub(r'\*\*([^\*]+)\*\*', r'<strong>\1</strong>', text)
    # Italic *text*
    text = re.sub(r'\*([^\*]+)\*', r'<em>\1</em>', text)
    return text

def convert_md_to_html(md_file, template):
    print(f"Converting {md_file}...")
    with open(md_file, 'r') as f:
        md_content = f.read()

    metadata = parse_metadata(md_content)
    html_content = simple_markdown_to_html(md_content)
    
    final_html = template.replace('{{title}}', metadata['title'])
    final_html = final_html.replace('{{content}}', html_content)
    final_html = final_html.replace('{{active_slug}}', Path(md_file).stem)
    
    return final_html

def main():
    template = get_template()
    md_files = list(Path(NOTES_DIR).glob('*.md'))
    
    for md_file in md_files:
        html_output = convert_md_to_html(md_file, template)
        output_path = Path(OUTPUT_DIR) / f"{md_file.stem}.html"
        
        with open(output_path, 'w') as f:
            f.write(html_output)
        print(f"Generated {output_path}")

if __name__ == "__main__":
    main()

