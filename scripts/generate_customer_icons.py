"""Render lightweight monochrome tab and UI icons into PNGs without native dependencies."""
from pathlib import Path
import cairosvg
out=Path(__file__).resolve().parents[1] / 'assets/customer/icons'
out.mkdir(parents=True,exist_ok=True)
paths={
 'home':'<path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/>',
 'search':'<circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/>',
 'message':'<path d="M20.5 11.5a8.5 8.5 0 0 1-8.5 8.5 10 10 0 0 1-4-.8L3 21l1.8-5A8.5 8.5 0 1 1 20.5 11.5Z"/>',
 'user':'<circle cx="12" cy="8" r="4"/><path d="M4.7 21a7.3 7.3 0 0 1 14.6 0"/>',
 'arrow-left':'<path d="m14.5 4.5-7.5 7.5 7.5 7.5"/>',
 'pin':'<path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 'bag':'<path d="M4 8h16l-1.4 13H5.4L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
 'heart':'<path d="M20.8 9.6C20.8 15 12 21 12 21S3.2 15 3.2 9.6a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z"/>',
 'filter':'<path d="M4 7h16M7 12h10M10 17h4"/>',
 'check':'<path d="m4.5 12.5 5 5 10-11"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'minus':'<path d="M5 12h14"/>',
 'phone':'<path d="M6 3h4l1 5-2 2a15 15 0 0 0 5 5l2-2 5 1v4a3 3 0 0 1-3 3C9.7 21 3 14.3 3 6a3 3 0 0 1 3-3Z"/>',
 'chevron-right':'<path d="m9 5 7 7-7 7"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 'sparkles':'<path d="m12 2 1.6 5.8L19.5 9l-5.9 1.7L12 16.5l-1.7-5.8L4.5 9l5.8-1.2L12 2Z"/><path d="m19.5 17 .6 2.4 2.4.6-2.4.6-.6 2.4-.7-2.4-2.3-.6 2.3-.6.7-2.4Z"/>',
}
for name,content in paths.items():
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="72" height="72"><g fill="none" stroke="#000000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{content}</g></svg>'''
 cairosvg.svg2png(bytestring=svg.encode(),write_to=str(out/(name+'.png')),output_width=96,output_height=96)
print('Generated',len(paths),'tab and UI icons')
