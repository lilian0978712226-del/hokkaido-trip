import re,pathlib
MAP={
 '#4A3B33':'#5B4B43','#7A6658':'#86756A','#A8978A':'#B6A89D',
 '#F08A5D':'#E8A386','#FBD9C8':'#F7E3D8',
 '#F6C1C7':'#F2D3D6','#FDE6E8':'#FBF0F1','#F7D3D6':'#F5E0E2',
 '#A9C7E3':'#C2D5E5','#E3EEF8':'#EEF3F8','#3E64A8':'#7690B8','#CFE3F2':'#DCE8F2','#8FB3D9':'#AFC6DD','#B9D3E8':'#CCDCEA','#C9DDEE':'#D6E3EE','#DCE9F4':'#E4EDF5',
 '#F2C14E':'#EBCD8A','#FCEDC0':'#F8F1DC','#F2A84E':'#EBC08E',
 '#8DB580':'#AEC6A4','#E3EFD9':'#EEF3E9','#7FAE76':'#A2BF98','#6E9E68':'#94B38B','#7AA86E':'#9DBA92',
 '#D9533F':'#CF8576','#D9774F':'#D6987F','#E8907A':'#E4A99A','#F2A893':'#EDC0B2',
 '#C98B5E':'#C9A083','#8E9BA8':'#A4AEB8','#FFF8EC':'#FFFAF2','#FBEFD9':'#FAF3E6','#F3E3C6':'#F1E7D6',
 '#9C8F86':'#ACA199','#B5AAA1':'#C2B9B1','#A99D94':'#B9AFA7',
}
def soften(t):
    for k,v in MAP.items():
        t=re.sub(re.escape(k),v,t,flags=re.I)
        kk='%23'+k[1:]
        t=re.sub(re.escape(kk),'%23'+v[1:],t,flags=re.I)
    return t
