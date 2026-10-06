# Fit a pinhole camera to the reference from the two 29er tyre outlines (R=0.37 m), then
# back-project mid-plane landmarks onto z=0 to get metric frame geometry.
import numpy as np, json
from scipy.optimize import least_squares
W_IMG,H_IMG=1348,1080; R=0.37
obs={'rL':73,'rR':571,'rT':556,'rB':1061,'fL':806,'fR':1278,'fT':580,'fB':1045}
def rot(yaw,pitch,roll):
    cy,sy=np.cos(yaw),np.sin(yaw); cp,sp=np.cos(pitch),np.sin(pitch); cr,sr=np.cos(roll),np.sin(roll)
    Ry=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]]); Rx=np.array([[1,0,0],[0,cp,-sp],[0,sp,cp]]); Rz=np.array([[cr,-sr,0],[sr,cr,0],[0,0,1]])
    return Ry@Rx@Rz  # camera-to-world
def project(p,P):
    W,cx,cy,cz,yaw,pitch,roll,f=P
    Rc=rot(yaw,pitch,roll); C=np.array([cx,cy,cz])
    q=(p-C)@Rc  # world->cam coords (cam looks -Z)
    x=W_IMG/2+f*q[...,0]/-q[...,2]; y=H_IMG/2-f*q[...,1]/-q[...,2]
    return x,y
t=np.linspace(0,2*np.pi,720)
def wheel(xc):
    return np.stack([xc+R*np.cos(t),R+R*np.sin(t),0*t],-1)
GRIPS={'near':(1030,415),'far':(870,410)}
def resid(Q):
    P=list(Q[:6])+[0.0]+[Q[6]]; xb,yb=Q[7],Q[8]; W=P[0]; out=[]
    for z,(gx,gy) in ((0.33,GRIPS['near']),(-0.33,GRIPS['far'])):
        x,y=project(np.array([xb,yb,z]),P); out+=[x-gx,y-gy]
    for k,xc in (('r',0.0),('f',W)):
        x,y=project(wheel(xc),P)
        out+= [x.min()-obs[k+'L'],x.max()-obs[k+'R'],y.min()-obs[k+'T'],y.max()-obs[k+'B']]
    return out
Q0=[1.09,0.55,0.8,1.8,0,0,1000,1.0,1.0]
s=least_squares(resid,Q0)
Q=s.x; P=np.array(list(Q[:6])+[0.0]+[Q[6]]); print('bar centre',Q[7:]); print('params W,cx,cy,cz,yaw,pitch,roll,f =',np.round(P,4)); print('resid px',np.round(s.fun,2))
fov=2*np.degrees(np.arctan(W_IMG/2/P[7])); print('hfov deg',round(fov,1))
def backproject(px,py,zplane=0.0):
    W,cx,cy,cz,yaw,pitch,roll,f=P; Rc=rot(yaw,pitch,roll)
    d_cam=np.array([(px-W_IMG/2)/f,-(py-H_IMG/2)/f,-1.0]); d=Rc@d_cam; C=np.array([cx,cy,cz])
    s_=(zplane-C[2])/d[2]; return C+s_*d
lm={'bb':(620,870),'ht_top':(912,425),'ht_bottom_crown':(938,518),'tt_st_junction':(550,600),'seat_clamp':(546,592),
    'saddle_top_mid':(490,386),'saddle_nose':(575,393),'saddle_tail':(402,382),'post_top':(500,410),
    'stem_bar':(968,407),'dt_logo_mid':(770,650),'fork_axle':(1042,812),'rear_axle':(322,809)}
out={k:np.round(backproject(*v),3).tolist() for k,v in lm.items()}
bb=np.array(out['bb'])
rel={k:[round(v[0]-bb[0],3),round(v[1],3)] for k,v in out.items()}
print(json.dumps(rel,indent=0))
# bar ends: near grip (z>0) and far grip; solve height/x assuming symmetric z=+-h
for name,(px,py),z in (('grip_near',(1030,415),0.36),('grip_far',(870,410),-0.36)):
    p=backproject(px,py,z); print(name,'at z',z,'->',[round(p[0]-bb[0],3),round(p[1],3)])
json.dump({'params':P.tolist(),'hfov':fov,'landmarks_bb_rel':rel},open('evidence/camera-solve.json','w'),indent=1)
