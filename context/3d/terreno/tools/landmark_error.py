# Deterministic substitute for Tier-1 silhouette IoU (unusable: cluttered shop background).
# Projects model landmarks (BB-origin metres, from terreno-dimensions.ts) through the solved camera
# and compares to hand-picked photo landmarks.
import numpy as np, math, json
W,H=1348,1080; f=934.04
C=np.array([0.032,0.952,1.332]); yaw,pitch=-0.0354,-0.1223
cy,sy=math.cos(yaw),math.sin(yaw); cp,sp=math.cos(pitch),math.sin(pitch)
R=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]])@np.array([[1,0,0],[0,cp,-sp],[0,sp,cp]])
def proj(p):
    q=(np.array(p)-C)@R; return (W/2+f*q[0]/-q[2], H/2-f*q[1]/-q[2])
HA=math.radians(71.5); D=np.array([-math.cos(HA),math.sin(HA),0]); N=np.array([math.sin(HA),math.cos(HA),0])
FA=np.array([0.637,0.37,0]); S0=FA-0.04*N; st=lambda s:S0+s*D
SA=math.radians(74.5); SD=np.array([-math.cos(SA),math.sin(SA),0]); BB=np.array([0,0.295,0]); sp_=lambda s:BB+s*SD
clamp=sp_(0.69)
model={'rear_axle':[-0.435,0.37,0],'front_axle':FA,'bb':BB,'ht_top':st(0.625),'crown':st(0.49),
 'tt_st':sp_(0.42),'saddle_nose':clamp+[0.004+0.122,0.05,0],'saddle_tail':clamp+[0.004-0.124,0.05,0],
 'bar_clamp':st(0.66)+0.11*np.array([1,0,0])}
photo={'rear_axle':(322,809),'front_axle':(1042,812),'bb':(620,870),'ht_top':(912,425),'crown':(938,518),
 'tt_st':(550,600),'saddle_nose':(575,393),'saddle_tail':(402,382),'bar_clamp':(968,407)}
out={}
for k,p in model.items():
    u,v=proj(p); e=math.hypot(u-photo[k][0],v-photo[k][1]); out[k]={'render_px':[round(u,1),round(v,1)],'photo_px':photo[k],'err_px':round(e,1),'err_m':round(e/660,3)}
errs=[o['err_px'] for o in out.values()]
out['_summary']={'mean_px':round(float(np.mean(errs)),1),'max_px':max(errs),'px_per_m_at_bike':660,'wheel_dia_px':488}
print(json.dumps(out,indent=1)); json.dump(out,open('evidence/landmark-error.json','w'),indent=1)
