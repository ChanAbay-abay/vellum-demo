"""Authors object-sculpt-spec.json components/materials for the Edge Gen2 from the starter spec.
Numbers here are the same constants as create-edge-model.ts geometry (metres)."""
import json, copy, sys
p = sys.argv[1]; s = json.load(open(p))
root_t = s['componentTree'][0]; base_m = s['materials'][0]
s['preSpecAssessment'] = json.load(open(p.replace('object-sculpt-spec.json','assessment.json')))['preSpecAssessment']

def comp(cid, name, level, parent, prim, topo, mat, dims, conf, pos, feats=(), socket=None, contact="embed", note=""):
    c = copy.deepcopy(root_t)
    c.update(id=cid, name=name, level=level, parent=parent, primitive=prim, topologyClass=topo,
             topologyRationale=note or f"{topo}: {name} is a {prim} part of a rigid bicycle assembly.",
             material=mat, materialLayers=[mat], confidence=conf, fidelityTier="form")
    c['dimensions'] = dict(width=dims[0], height=dims[1], depth=dims[2], units="m", confidence=conf)
    c['transform']['position'] = pos
    c['localFeatures'] = [dict(id=f[0], description=f[1]) for f in feats]
    c['actionProfile']['animationRole'] = 'root' if parent is None else 'rigid-child'
    c['actionProfile']['fractureGroup'] = cid
    c['actionProfile']['destruction']['fractureGroup'] = cid
    c['evidenceRefs'] = ['full-object']
    c['geometryDescriptor']['edgeTreatment'] = {"type": "chamfer", "bevelRadius": 0.002, "segments": 1}
    if parent:
        c['attachment'] = dict(parentId=parent, parentSocket=socket or f"{parent}-socket", localStart=[0,0,0],
                               localEnd=[0,0,0], contactType=contact, embedDepth=0.004, gapTolerance=0.002,
                               evidenceRefs=['full-object'])
    return c

C = [
 comp('bike','Edge Gen2 assembly','macro',None,'group','assembled-solid','paint-white',[1.65,1.0,0.42],0.7,[0,0,0]),
 comp('frame','Frame','macro','bike','loft','assembled-solid','paint-white',[0.6,0.55,0.12],0.6,[0,0.267,0]),
 comp('head-tube','Head tube (tapered, faceted)','meso','frame','loft','hard-surface-prismatic','paint-white',[0.06,0.15,0.055],0.6,[0.4,0.75,0]),
 comp('top-tube','Top tube','meso','frame','loft','hard-surface-prismatic','paint-white',[0.52,0.04,0.04],0.6,[0.12,0.78,0],[('tt-grey-band','mid-grey side panel 25-70% along tube (observed, medium)')]),
 comp('down-tube','Down tube','meso','frame','loft','hard-surface-prismatic','paint-white',[0.6,0.06,0.065],0.7,[0.2,0.48,0],[('dt-wordmark','black vellum wordmark decal, brand SVG, NDS reads HT->BB (observed), DS reads BB->HT (inferred)')]),
 comp('seat-tube','Seat tube','meso','frame','loft','hard-surface-prismatic','paint-black',[0.05,0.5,0.04],0.55,[-0.07,0.52,0],[('st-light-band','light band on black seat tube (observed, medium)')]),
 comp('seat-stays','Seat stays (pair)','meso','frame','loft','hard-surface-prismatic','paint-white',[0.27,0.37,0.13],0.6,[-0.27,0.52,0]),
 comp('chain-stays','Chain stays (pair, boxy)','meso','frame','loft','hard-surface-prismatic','paint-white',[0.4,0.04,0.13],0.6,[-0.2,0.3,0]),
 comp('bb-shell','BB shell','meso','frame','cylinder','hard-surface-prismatic','paint-white',[0.07,0.07,0.086],0.4,[0,0.267,0]),
 comp('dropouts','Rear dropouts','micro','frame','extrude','hard-surface-prismatic','alloy-black',[0.03,0.03,0.006],0.4,[-0.399,0.337,0]),
 comp('fork','Fork','macro','bike','loft','assembled-solid','paint-black',[0.12,0.4,0.11],0.7,[0.5,0.5,0],[('fork-decal','small white decal near fork tip (observed, low)')],'head-tube-bottom','socket'),
 comp('brake-front','Front rim caliper','meso','fork','extrude','hard-surface-prismatic','alloy-silver',[0.03,0.06,0.07],0.75,[0.55,0.66,0],socket='fork-crown',contact='bolt'),
 comp('brake-rear','Rear rim caliper','meso','frame','extrude','hard-surface-prismatic','alloy-silver',[0.03,0.06,0.07],0.75,[-0.19,0.63,0],socket='seatstay-bridge',contact='bolt'),
 comp('wheel-front','Front wheel','macro','fork','lathe','revolved','carbon-rim',[0.674,0.674,0.03],0.8,[0.57,0.337,0],socket='fork-dropouts',contact='socket'),
 comp('wheel-rear','Rear wheel','macro','frame','lathe','revolved','carbon-rim',[0.674,0.674,0.03],0.8,[-0.399,0.337,0],socket='rear-dropouts',contact='socket'),
 comp('rim','Deep carbon rim 50mm','meso','wheel-front','lathe','revolved','carbon-rim',[0.622,0.622,0.027],0.8,[0,0,0]),
 comp('tyre-tan','Tan-wall tyre','meso','wheel-front','lathe','revolved','tyre-tan',[0.674,0.674,0.026],0.85,[0,0,0]),
 comp('spokes','Spokes (instanced)','micro','wheel-front','cylinder','instanced','spoke-black',[0.25,0.002,0.002],0.5,[0,0,0]),
 comp('hub','Hubs','meso','wheel-front','lathe','revolved','alloy-black',[0.04,0.04,0.1],0.5,[0,0,0]),
 comp('drivetrain','Drivetrain','macro','frame','group','assembled-solid','alloy-black',[0.5,0.25,0.1],0.3,[-0.2,0.3,0.045],socket='bb-shell'),
 comp('crankset','Crankset 50/34 + arms (inferred)','meso','drivetrain','extrude','hard-surface-prismatic','alloy-black',[0.22,0.22,0.1],0.3,[0,0.267,0.045]),
 comp('chain','Chain (instanced links)','micro','drivetrain','instanced-cluster','instanced','chain-steel',[0.5,0.2,0.01],0.4,[-0.2,0.3,0.045]),
 comp('cassette','Cassette (inferred)','meso','drivetrain','cylinder','revolved','chain-steel',[0.12,0.12,0.04],0.3,[-0.399,0.337,0.04]),
 comp('rear-derailleur','Rear derailleur (inferred)','meso','drivetrain','extrude','hard-surface-prismatic','alloy-black',[0.06,0.1,0.03],0.25,[-0.39,0.25,0.06]),
 comp('front-derailleur','Front derailleur (inferred)','micro','drivetrain','extrude','hard-surface-prismatic','alloy-black',[0.06,0.03,0.02],0.25,[-0.03,0.38,0.03]),
 comp('cockpit','Cockpit','macro','fork','group','assembled-solid','alloy-black',[0.2,0.15,0.42],0.55,[0.42,0.86,0],socket='steerer-top'),
 comp('stem','Stem + spacers','meso','cockpit','loft','hard-surface-prismatic','alloy-black',[0.11,0.04,0.035],0.6,[0.42,0.86,0]),
 comp('handlebar','Drop bar (drops inferred)','meso','cockpit','tube','swept','alloy-black',[0.1,0.13,0.42],0.45,[0.47,0.86,0]),
 comp('hoods','Brake/shift lever hoods','meso','cockpit','loft','hard-surface-organic','rubber-black',[0.08,0.04,0.03],0.5,[0.55,0.85,0]),
 comp('cable-housing','Cable housing loops','micro','cockpit','tube','swept','rubber-black',[0.15,0.2,0.005],0.5,[0.45,0.78,0]),
 comp('seatpost-saddle','Seatpost + saddle','macro','frame','group','assembled-solid','paint-black',[0.28,0.3,0.14],0.5,[-0.2,0.85,0],socket='seat-tube-top'),
 comp('seatpost','Black aero seatpost','meso','seatpost-saddle','loft','hard-surface-prismatic','paint-black',[0.03,0.25,0.025],0.65,[-0.18,0.85,0]),
 comp('saddle','Saddle (top inferred)','meso','seatpost-saddle','loft','hard-surface-organic','saddle-black',[0.27,0.05,0.14],0.35,[-0.22,0.96,0]),
 comp('bottle-cage','Cage + bottle, red cap','meso','frame','lathe','revolved','alloy-black',[0.2,0.075,0.075],0.55,[0.15,0.52,0],[('bottle-cap','red cap')],socket='down-tube-bosses',contact='bolt'),
]
PRIM={'group':'box','loft':'curve-sweep'}
MC={'paint-white':'plastic','paint-black':'plastic','alloy-black':'metal','alloy-silver':'metal','carbon-rim':'plastic','tyre-tan':'rubber','spoke-black':'metal','chain-steel':'metal','rubber-black':'rubber','saddle-black':'plastic'}
HEX={'paint-white':'#E9E9E6','paint-black':'#16171A','alloy-black':'#1C1C1E','alloy-silver':'#C9CACC','carbon-rim':'#141416','tyre-tan':'#A9825A','spoke-black':'#1A1A1C','chain-steel':'#6B6D70','rubber-black':'#121213','saddle-black':'#151516'}
def rgba(h): return 'rgba(%d, %d, %d, 1)'%tuple(int(h[i:i+2],16) for i in (1,3,5))
for c in C:
    c['primitive']=PRIM.get(c['primitive'],c['primitive'])
    c['topologyClass']='fiber-strand' if c['id'] in ('spokes','cable-housing','chain') else 'assembled-solid'
    sec='#0B0B0A' if c['id']=='down-tube' else ('#A9825A' if c['id'] in ('wheel-front','wheel-rear') else HEX[c['material']])
    c['colorMaterialRecipe']=dict(dominantAlbedo=rgba(HEX[c['material']]),secondaryAlbedo=rgba(sec),materialClass=MC[c['material']],materialClassConfidence=0.7,evidenceRefs=['full-object'])
s['componentTree'] = C

def mat(mid, name, color, rough, metal=0.0, clear=None, overrides=()):
    m = copy.deepcopy(base_m)
    m.update(id=mid, name=name, baseColor=color, color=color, type='physical' if clear else 'standard')
    m['albedo'] = dict(dominant=color, secondary=[color], samplingNotes='flat paint/solid finish; sampled from gen2 crops, de-graded by eye')
    m['colorVariation'] = dict(palette=[color], pattern='none', amplitude=0.0, heightCorrelation=0.0)
    m['roughness'] = dict(base=rough, variation=0.0, map='none (uniform finish)', localResponse='uniform')
    m['metalness'] = dict(base=metal, variation=0.0)
    m['normal'] = dict(pattern='none', strength=0.0, scale=1.0, space='tangent')
    if clear is not None: m['clearcoat'] = clear
    m['localOverrides'] = [dict(id=o[0], description=o[1], roughness=o[2]) for o in overrides]
    return m
s['materials'] = [
 mat('paint-white','White gloss frame paint','#E9E9E6',0.28,clear=1.0,overrides=[('frame-gloss','clearcoat highlight',0.2)]),
 mat('paint-black','Black gloss paint (fork, seat tube, post)','#16171A',0.32,clear=1.0),
 mat('paint-grey','Mid-grey band paint','#8C8E91',0.32,clear=1.0),
 mat('decal-black','Matte black decal','#0B0B0A',0.55),
 mat('carbon-rim','Black satin carbon rim','#141416',0.42,clear=0.4),
 mat('tyre-tan','Tan gum sidewall + black tread','#A9825A',0.8),
 mat('spoke-black','Black spokes','#1A1A1C',0.4,metal=0.6),
 mat('alloy-black','Anodised black alloy','#1C1C1E',0.45,metal=0.5),
 mat('alloy-silver','Polished caliper alloy','#C9CACC',0.22,metal=1.0),
 mat('chain-steel','Chain/cassette steel','#6B6D70',0.35,metal=1.0),
 mat('rubber-black','Hood/housing rubber','#121213',0.7),
 mat('saddle-black','Saddle synthetic','#151516',0.55),
]
s['repetitionSystems'] = [
 dict(id='spokes', componentRef='spokes', geometry='cylinder', instances=42, distribution='front 18 radial, rear 24 two-cross-ish straight', buildsGeometry=True),
 dict(id='chain-links', componentRef='chain', geometry='box', instances=110, distribution='spaced along closed chain path', buildsGeometry=True),
 dict(id='chainring-teeth', componentRef='crankset', geometry='extrude', instances=84, distribution='50T + 34T rings', buildsGeometry=True),
]
T = lambda i,n,tier,refs,passes: dict(id=i,name=n,tier=tier,passIds=passes,minimumScore=0.7 if tier=='critical' else 0.6,mustPass=tier=='critical',componentRefs=refs,evidenceRefs=['full-object'])
allp = [b['id'] for b in s['buildPasses']]
s['featureReviewTargets'] = [
 T('frame-silhouette','Diamond frame proportions, sloping TT, sharp-edged tubes','critical',['frame','top-tube','down-tube','seat-tube'],allp),
 T('white-black-scheme','White frame / black fork / black seat tube+post','critical',['frame','fork','seat-tube','seatpost'],allp),
 T('dt-wordmark','Black vellum wordmark along down tube','critical',['down-tube'],allp),
 T('deep-rims-tanwall','Deep black rims with tan-wall tyres','critical',['wheel-front','wheel-rear','rim','tyre-tan'],allp),
 T('rim-brakes','Silver rim calipers front+rear','important',['brake-front','brake-rear'],allp),
 T('cockpit-black','Black stem/bar/hoods with cable loops','important',['stem','handlebar','hoods','cable-housing'],allp),
]
s['performanceBudget'] = dict(targetTriangles=150000, maxDrawCalls=40, textures='none (geometry decal for wordmark)')
s['coordinateFrame'] = dict(units='m', up='+Y', forward='+X', lateral='+Z drive side', origin='ground under bottom bracket')
s['assumptions'] = s['preSpecAssessment']['unknownsToResolveBeforeImplementation']
json.dump(s, open(p,'w'), indent=1)
print('ok', len(C), 'components')
