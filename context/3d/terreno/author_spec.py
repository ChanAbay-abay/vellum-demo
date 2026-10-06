# Fills object-sculpt-spec.json with the Terreno component tree / materials (pipeline input, not a report).
import json, copy
s=json.load(open('object-sculpt-spec.json'))
root_t=copy.deepcopy(s['componentTree'][0]); mat_t=copy.deepcopy(s['materials'][0])
cam=json.load(open('evidence/camera-solve.json'))
s['referenceCamera']={'solved':True,'fovDegrees':60.1,'aspect':1348/1080,'orientation':{'yaw':-0.0354,'pitch':-0.1223,'roll':0.0},
 'positionHint':[0.032,0.952,1.332],'note':'solve_camera.py: tyre outlines + grip ends, roll fixed 0, BB-origin metres; used by review harness'}
s['suitability']='conditional'
s['scores']=dict(object_isolation=2,silhouette_readability=3,depth_inference=2,primitive_decomposition=3,material_procedurality=3,occlusion_risk=1,interaction_fit=2)
s['coordinateFrame']={'front':'+X (front wheel)','up':'+Y','scaleReference':'metres, origin on ground under BB, drive side +Z'}
s['silhouette']={'boundingShape':'2.0 x 1.03 m side profile (tyre-to-tyre x saddle height)','aspectRatios':['wheelbase/wheel dia 1.48'],
 'symmetry':'bilateral except drivetrain (+Z) and brakes (-Z)','dominantCurves':['two 0.74 m tyre circles','diamond front triangle'],
 'negativeSpaces':['front triangle','rear triangle','spoke fields'],'landmarks':list(cam['landmarks_bb_rel'].keys())}
s['viewEvidence'][0]['observations']=['drive-side profile, wide-angle phone camera ~1.33 m from bike plane (hfov ~72 deg)']
s['assumptions']=['bar width 0.74 m','tube Z widths from XC norms','rear caliper on NDS chainstay (hidden)','camera solve approx +-3 cm']
s['risks']=['strong perspective in reference: lab near-ortho side view cannot overlay 1:1; use solved-camera harness for overlay']
s['lightingFromPhoto']=[{'type':'environment','note':'shop ceiling fluorescent -> RoomEnvironment PMREM in lab'},
 {'type':'key','note':'overhead diffuse key, highlights along top of TT and DT'},{'type':'fill','note':'hemisphere fill from floor bounce'},
 {'type':'rim','note':'lab rim light'},{'type':'exposure','note':'ACES filmic tone mapping, exposure 1'},{'type':'contact shadow','note':'none in lab; tyres touch ground plane y=0'}]
s['performanceBudget'].update(targetTriangles=150000,maxDrawCalls=60,textureSize=1024,fpsTarget=60)
def rgba(c): return 'rgba(%d, %d, %d, 1.0)'%c
MATS=[('carbon-ud','Black UD carbon satin','physical',(14,14,16),0.42,0,'metal',False),
('carbon-gloss','Gloss carbon accents (rims, chainstay)','physical',(10,10,12),0.3,0,'plastic',True),
('graphic-grey','Grey frame graphic decal','physical',(110,112,116),0.4,0.2,'plastic',True),
('copper-accent','Copper seat-tube band','physical',(176,104,70),0.3,1,'metal',True),
('tyre-tread','Black tread rubber','standard',(20,20,20),0.9,0,'rubber',True),
('tyre-sidewall','Tan skinwall','standard',(214,180,152),0.8,0,'rubber',False),
('alloy-silver','Polished silver alloy/steel','standard',(205,208,212),0.28,1,'metal',False),
('chain-gold','Gold chain','standard',(200,160,80),0.3,1,'metal',True),
('anodised-gold','Gold anodised spindle','standard',(210,150,60),0.3,1,'metal',True),
('black-satin','Black satin alloy/plastic parts','standard',(18,18,20),0.55,0.3,'plastic',True),
('rubber-black','Grip/saddle black','standard',(16,16,16),0.75,0,'rubber',True),
('spoke-steel','Black spokes','standard',(25,25,28),0.4,0.7,'metal',True),
('rotor-steel','Rotor steel','standard',(170,172,175),0.35,1,'metal',True)]
mats=[]
for mid,name,typ,col,rough,metal,cls,util in MATS:
    m=copy.deepcopy(mat_t); m.update(id=mid,name=name,type=typ,baseColor='#%02X%02X%02X'%col,color='#%02X%02X%02X'%col)
    m['albedo']={'dominant':m['color'],'secondary':[m['color']],'samplingNotes':'sampled from reference crops'}
    m['roughness']={'base':rough,'variation':0.08,'map':'independent-procedural-field','localResponse':'satin'}
    m['metalness']={'base':metal,'variation':0.0}
    if mid=='carbon-ud': m['clearcoat']={'value':0.6,'roughness':0.35}; m['notes']='UD fibre streak canvas texture as roughness/bump along tube axis'
    if util: m['qualityTier']='utility'
    m['localOverrides']=[]
    ev={'carbon-ud':'frame-carbon','tyre-sidewall':'tyre-sidewall','alloy-silver':'drivetrain-silver','carbon-gloss':'rim-carbon'}.get(mid)
    if ev:
        r=json.load(open(f'material-evidence/{ev}.json'))
        rp=r.get('referencePbr') or {}
        m['referencePbr']={'usable':True,'confidence':r.get('confidence'),'source':f'material-evidence/crop-{ev}.png',
          'maps':{c:{'path':f'material-evidence/{ev}/{ev}-{c}.png'} for c in ('albedo','roughness','height','normal','ao')}}
    mats.append(m)
s['materials']=mats
# local overrides that carry detail-inventory entries
def ov(mid,oid,desc,**kw):
    for m in s['materials']:
        if m['id']==mid: m['localOverrides'].append(dict(id=oid,description=desc,**kw))
ov('graphic-grey','dt-logo','VELLUM wordmark along DT drive+non-drive faces',roughness=0.4)
ov('graphic-grey','ht-fade','grey fade on head tube / TT front',roughness=0.4)
ov('copper-accent','copper-band','band on seat tube 0.05 m below TT junction',roughness=0.25)
ov('tyre-sidewall','tan-sidewall','tan band between tread and rim bead',roughness=0.8)
ov('carbon-ud','ud-fibre','unidirectional fibre streaks along tube axis (roughness/bump field)',roughness=0.25)
C=[] # id,name,level,parent,primitive,topology,material,features,attach
def comp(i,name,level,parent,prim,topo,mat,feats=(),dims=(0.1,0.1,0.1),pos=(0,0,0),role='part'):
    c=copy.deepcopy(root_t); c.update(id=i,name=name,level=level,parent=parent,primitive=prim,topologyClass=topo,
      topologyRationale=f'{topo}: {name} is a manufactured part built from {prim}',material=mat,materialLayers=[mat],role=role,
      localFeatures=[{'id':f,'description':f} for f in feats],importance=0.8 if level=='macro' else 0.5,confidence=0.75,
      dimensions={'width':dims[0],'height':dims[1],'depth':dims[2],'units':'m','confidence':0.7},
      transform={'position':list(pos),'rotation':[0,0,0],'scale':[1,1,1]},fidelityTier='form')
    c['geometryDescriptor']['topologyIntent']=f'{prim} hard-surface'
    m=next(x for x in MATS if x[0]==mat)
    c['colorMaterialRecipe']={'dominantAlbedo':rgba(m[3]),'secondaryAlbedo':rgba(m[3]),'materialClass':m[6],'materialClassConfidence':0.8}
    if parent:
        c['attachment']={'parentSocket':parent,'localStart':list(pos),'localEnd':list(pos),'contactType':'embed','embedDepth':0.005,'gapTolerance':0.003}
    c['actionProfile']['animationRole']='root' if parent is None else ('rotor' if 'wheel' in i or 'crank' in i else 'static-child')
    C.append(c)
comp('frame','Frame','macro',None,'curve-sweep','assembled-solid','carbon-ud',['sloping-tt','diamond-dt','ud-fibre'],(1.0,0.7,0.12),role='body')
for i,n,f in (('head-tube','Head tube + integrated headset',['ht-fade']),('top-tube','Top tube',['sloping-tt']),('down-tube','Down tube',['diamond-dt','dt-logo']),
  ('seat-tube','Seat tube',['copper-band']),('chainstays','Chainstays',[]),('seatstays','Seatstays',[]),('dropouts','Dropouts + thru-axle',[])):
    comp(i,n,'meso','frame','curve-sweep','assembled-solid','carbon-ud',f)
comp('fork','Suspension fork','macro',None,'cylinder','assembled-solid','black-satin',['fork-sid'],(0.12,0.6,0.14))
for i,n in (('fork-crown','Crown + steerer'),('stanchions','Stanchions'),('lowers','Lowers + arch')): comp(i,n,'meso','fork','cylinder','assembled-solid','black-satin')
for w in ('wheel-front','wheel-rear'):
    comp(w,w,'macro',None,'torus','assembled-solid','carbon-gloss',['spoke-lacing'],(0.74,0.74,0.06))
    comp(w+'-tyre','tyre','meso',w,'lathe','assembled-solid','tyre-sidewall',['tan-sidewall','tread-band'])
    comp(w+'-rim','rim','meso',w,'lathe','assembled-solid','carbon-gloss')
    comp(w+'-hub','hub','meso',w,'lathe','assembled-solid','black-satin')
    comp(w+'-spokes','spokes','meso',w,'instanced-cluster','fiber-strand','spoke-steel')
    comp(w+'-rotor','rotor','meso',w,'extrude','assembled-solid','rotor-steel',['rotor-front'] if w=='wheel-front' else [])
comp('drivetrain','Drivetrain','macro',None,'box','assembled-solid','alloy-silver',['silver-crank'],(0.8,0.3,0.1))
for i,n,m,f in (('crankset','Cranks + chainring','alloy-silver',['silver-crank']),('cassette','Cassette','alloy-silver',['big-cassette']),('chain','Chain','chain-gold',['gold-chain']),
  ('derailleur','Rear derailleur','black-satin',['rd-direct']),('pedals','Pedals','black-satin',[]),('spindle','BB spindle','anodised-gold',[])):
    comp(i,n,'meso','drivetrain','extrude','assembled-solid',m,f)
comp('cockpit','Cockpit','macro',None,'box','assembled-solid','black-satin',['slammed-stem'])
for i,n,m in (('stem','Stem','black-satin'),('handlebar','Flat bar','black-satin'),('grips','Lock-on grips','rubber-black'),('levers','Brake levers','black-satin')):
    comp(i,n,'meso','cockpit','cylinder','assembled-solid',m)
comp('seatpost-saddle','Seatpost + saddle','macro',None,'box','assembled-solid','black-satin',['saddle'])
comp('seatpost','Seatpost','meso','seatpost-saddle','cylinder','assembled-solid','black-satin')
comp('saddle-shell','Saddle shell','meso','seatpost-saddle','extrude','conforming-shell','rubber-black')
s['componentTree']=C
s['repetitionSystems']=[{'id':i,'description':d,'instances':n,'geometry':g,'buildsGeometry':True} for i,d,n,g in (
 ('spokes','28 spokes per wheel, 2-cross lacing',56,'InstancedMesh cylinder'),('cassette-cogs','12 cogs 10-52T',12,'ring shapes'),
 ('chainring-teeth','34T narrow-wide teeth',34,'extruded shape'),('tread-knobs','tread knob ring per tyre',2*90,'InstancedMesh box'),('chain-links','gold chain links along path',120,'InstancedMesh box'))]
FT=[('wheel-tyre-identity','29in tan-wall tyres with black tread band, black deep rims, black spokes','critical',['wheel-front','wheel-rear']),
('frame-geometry','sloping TT, low cluster, oversize DT, HA ~69.5, wheelbase ~1.09','critical',['frame']),
('drivetrain-identity','silver 1x crank + large cassette + gold chain + black RD','critical',['drivetrain']),
('cockpit-fork','black suspension fork, low long stem, flat bar','important',['fork','cockpit']),
('frame-finish','black UD satin carbon with grey DT logo and copper ST band','critical',['frame'])]
s['featureReviewTargets']=[{'id':i,'name':n,'tier':t,'passIds':['blockout','structural-pass','form-refinement','material-pass'],'minimumScore':0.75 if t=='critical' else 0.7,
 'mustPass':t=='critical','componentRefs':r,'evidenceRefs':['full-object']} for i,n,t,r in FT]
# detail inventory kinds + mapsTo
kinds={'tan-sidewall':'decal','tread-band':'ridge','dt-logo':'decal','copper-band':'decal','diamond-dt':'contour','sloping-tt':'contour','silver-crank':'gloss',
 'big-cassette':'hole','gold-chain':'gloss','rd-direct':'contour','spoke-lacing':'linework','rotor-front':'hole','fork-sid':'decal','slammed-stem':'contour','saddle':'contour'}
for d in s['preSpecAssessment']['detailInventory']['details']:
    d['kind']=kinds[d['id']]; d['mapsTo']={'ref':d['id']}
s['preSpecAssessment']['unknownsToResolveBeforeImplementation']=[]
s['preSpecAssessment']['resolvedUnknowns']=['NDS layout: rotors/calipers on -Z per standard MTB (secondary photo consistent)','bar width 0.74 m assumed','tube Z widths: XC norms','rear caliper: post-mount on NDS chainstay, inferred']
json.dump(s,open('object-sculpt-spec.json','w'),indent=1)
