"""Authors object-sculpt-spec.json for the Fuerza from the skill's generated skeleton.
Run from the skill root: python3 <this> <skeleton.json> <out.json>"""
import copy, json, sys

skel = json.load(open(sys.argv[1]))
spec = copy.deepcopy(skel)
tmpl = skel["componentTree"][0]
mtmpl = skel["materials"][0]

# ---------- detail inventory ----------
details = [
  ("dt-wordmark", "decal", "slanted 'vellum' wordmark along down tube, reading up toward head tube", (0.49,0.44,0.17,0.17), "frame-white/dt-wordmark"),
  ("tt-stripe", "decal", "4-band retro stripe at seat end of top tube: burgundy, red, orange-red, orange", (0.36,0.42,0.16,0.03), "frame-white/tt-stripe"),
  ("cs-stripe", "decal", "4-band retro stripe on chainstay at BB end", (0.33,0.60,0.08,0.05), "frame-white/cs-stripe"),
  ("bb-burgundy", "decal", "burgundy BB shell visible through crank spider", (0.40,0.60,0.05,0.04), "frame-white/bb-burgundy"),
  ("fork-badge", "decal", "burgundy V badge band on fork leg above dropout", (0.73,0.56,0.03,0.03), "frame-white/fork-badge"),
  ("cs-badge", "decal", "burgundy V badge near rear dropout on chainstay", (0.27,0.61,0.02,0.02), "frame-white/cs-badge"),
  ("bottle-bolts", "fastener", "2 bottle bolts on down tube + 2 on seat tube", (0.41,0.52,0.14,0.06), "frame/bottle-bolts"),
  ("paint-gloss", "gloss", "gloss clearcoat highlight on white paint", (0.45,0.40,0.30,0.25), "frame-white/clearcoat-gloss"),
  ("tyre-rim-seam", "seam", "tyre/rim boundary: matte rubber vs satin carbon", (0.05,0.46,0.90,0.30), "wheel-front/tyre-rim-seam"),
  ("rotor-spider", "hole", "disc rotor cut-outs and spider arms", (0.72,0.57,0.06,0.06), "wheel-front/rotor-spider"),
  ("saddle-channel", "hole", "saddle central relief channel / short-nose shell", (0.26,0.31,0.16,0.03), "seatpost-saddle/saddle-channel"),
  ("top-cap", "bevel", "integrated stem top cap and headset spacer stack", (0.63,0.37,0.05,0.03), "cockpit/top-cap"),
]
inv = spec["preSpecAssessment"]["detailInventory"]
inv["scanMethod"] = "grid-3x3"
inv["details"] = [dict(id=i, kind=k, description=d, region=dict(x=r[0],y=r[1],width=r[2],height=r[3],units="normalized"),
  scale="meso" if k!="gloss" else "macro", affects="albedo" if k=="decal" else ("roughness" if k=="gloss" else "geometry"),
  mapsTo=dict(type="material.localOverrides" if "frame-white" in m else "component.localFeatures", ref=m),
  evidenceRef="full-object", confidence=0.8) for i,k,d,r,m in details]

MATS = [("frame-white","","#E6E8E6"),("carbon-black","","#151515"),("rim-carbon","","#0E0E0E"),("tyre-rubber","","#141414"),
 ("steel","","#9A9A9A"),("drivetrain-black","","#1A1A1A"),("cockpit-black","","#121212"),("saddle-black","","#161616"),("stripe-paints","","#B23B36")]
# ---------- components ----------
def comp(cid, name, level, parent, primitive, topo, rationale, dims, pos, material, feats=(), attach=None, role="part", anim="static-part", pivot=None, axis=(0,0,1)):
    c = copy.deepcopy(tmpl)
    c.update(id=cid, name=name, level=level, parent=parent, primitive=primitive, role=role,
             topologyClass=topo, topologyRationale=rationale, material=material, materialLayers=[material],
             confidence=0.75, importance=1.0 if level=="macro" else (0.7 if level=="meso" else 0.4),
             fidelityTier="form", evidenceRefs=["full-object"])
    c["dimensions"] = dict(width=dims[0], height=dims[1], depth=dims[2], units="metres", confidence=0.75)
    c["transform"]["position"] = list(pos)
    c["localFeatures"] = [dict(id=f[0], kind=f[1], description=f[2]) for f in feats]
    c["actionProfile"]["animationRole"] = anim
    c["actionProfile"]["pivot"].update(mode="socket", localPosition=list(pivot or pos), axis=list(axis), confidence=0.8)
    c["actionProfile"]["collider"]["type"] = "capsule" if primitive in ("tube","cylinder","lathe") else "box"
    c["actionProfile"]["destruction"]["fractureGroup"] = cid
    c["geometryDescriptor"]["topologyIntent"] = rationale
    if attach is not None:
        attach["parentId"] = parent
    c["attachment"] = attach
    hexes = {m[0]: m[2] for m in MATS}
    h = hexes.get(material, "#808080"); r,g,b = int(h[1:3],16),int(h[3:5],16),int(h[5:7],16)
    klass = {"steel":"metal","drivetrain-black":"metal","tyre-rubber":"rubber","cockpit-black":"rubber","saddle-black":"fabric"}.get(material,"plastic")
    c["colorMaterialRecipe"] = dict(dominantAlbedo=f"rgba({r}, {g}, {b}, 1.0)", secondaryAlbedo=f"rgba({max(r-20,0)}, {max(g-20,0)}, {max(b-20,0)}, 1.0)",
        materialClass=klass, materialClassConfidence=0.8, evidenceRefs=["full-object"])
    return c

def att(socket, parent_id, start, end, contact="socket", embed=0.005):
    return dict(parentSocket=socket, parentId=parent_id, localStart=list(start), localEnd=list(end),
                contactType=contact, embedDepth=embed, overlap=embed, gapTolerance=0.002)

C = []
C.append(comp("root","Vellum Fuerza Disc","macro",None,"box","assembled-solid","assembly root, origin on ground under BB",(1.69,1.01,0.44),(0,0,0),"frame-white",role="body",anim="root"))
C.append(comp("frame","Frame","macro","root","extrude","assembled-solid","swept tubes with elliptical aero sections joined at nodes",(1.0,0.6,0.12),(0,0,0),"frame-white",
  feats=[("bottle-bolts","fastener","4 instanced bolt heads"),("dropped-stays","contour","seatstays meet seat tube at 0.66 m")],anim="static-part"))
for cid,name,a,b,mat,w in [
  ("top-tube","Top tube",(0.383,0.80,0),(-0.155,0.746,0),"frame-white",0.024),
  ("down-tube","Down tube (aero)",(0.43,0.70,0),(0.03,0.31,0),"frame-white",0.058),
  ("head-tube","Head tube",(0.383,0.824,0),(0.435,0.682,0),"frame-white",0.05),
  ("seat-tube","Seat tube / mast (black, curved cutout)",(0,0.30,0),(-0.155,0.76,0),"carbon-black",0.042),
  ("seatstays","Dropped seatstays x2",(-0.126,0.66,0),(-0.408,0.343,0),"frame-white",0.014),
  ("chainstays","Chainstays x2",(-0.02,0.27,0),(-0.408,0.343,0),"frame-white",0.03)]:
    C.append(comp(cid,name,"meso","frame","tube","assembled-solid","CatmullRom centreline + elliptical cross-section tube",(w,w,w),a,mat,
      attach=att("frame-node","frame",a,b,"butt-weld")))
C.append(comp("bb-shell","BB shell","meso","frame","cylinder","assembled-solid","short wide cylinder at origin+0.271",(0.07,0.07,0.09),(0,0.271,0),"frame-white",attach=att("bb","frame",(0,0.271,-0.045),(0,0.271,0.045))))
C.append(comp("fork","Fork","macro","root","tube","assembled-solid","tapered curved legs + crown + steerer",(0.06,0.38,0.12),(0.435,0.682,0),"frame-white",
  feats=[("fork-crown","bevel","crown blends into head tube"),("fork-taper","contour","legs taper 38->16 mm with forward rake curve")],
  attach=att("head-tube-bottom","frame",(0.435,0.682,0),(0.584,0.343,0)),anim="steer",pivot=(0.41,0.75,0),axis=(0.292,-0.956,0)))
for side,ax in (("rear",-0.408),("front",0.584)):
    C.append(comp(f"wheel-{side}",f"Wheel {side}","macro","root","lathe","assembled-solid","lathed rim+tyre profile, instanced spokes",(0.686,0.686,0.028),(ax,0.343,0),"rim-carbon",
      feats=[("tyre-rim-seam","seam","tyre/rim boundary at r=0.31"),("rotor-spider","hole","rotor with cut-outs")],
      attach=att("axle","frame" if side=="rear" else "fork",(ax,0.343,-0.05),(ax,0.343,0.05),"axle-through"),anim="spin",pivot=(ax,0.343,0)))
    C.append(comp(f"tyre-{side}",f"Tyre {side}","meso",f"wheel-{side}","torus","assembled-solid","torus 28 mm section",(0.686,0.686,0.028),(ax,0.343,0),"tyre-rubber",attach=att("rim-bed",f"wheel-{side}",(ax,0.66,0),(ax,0.686,0),"overlap")))
    C.append(comp(f"rotor-{side}",f"Disc rotor {side}","micro",f"wheel-{side}","lathe","assembled-solid","flat ring + spider",(0.16,0.16,0.002),(ax,0.343,-0.05),"steel",attach=att("hub-flange",f"wheel-{side}",(ax,0.343,-0.05),(ax,0.343,-0.048))))
C.append(comp("drivetrain","Drivetrain","macro","root","instanced-cluster","assembled-solid","rings, cranks, cassette, derailleurs, chain",(0.6,0.3,0.08),(0,0.271,0.05),"drivetrain-black",anim="spin",pivot=(0,0.271,0)))
for cid,name,mat,prim,pos in [("chainrings","Chainrings 48/35 + spider","drivetrain-black","lathe",(0,0.271,0.06)),
  ("cranks","Crank arms 172.5","drivetrain-black","extrude",(0,0.271,0.07)),
  ("cassette","Cassette 12s","steel","lathe",(-0.408,0.343,0.03)),
  ("rear-derailleur","Rear derailleur + battery","drivetrain-black","box",(-0.40,0.27,0.05)),
  ("front-derailleur","Front derailleur","drivetrain-black","box",(-0.05,0.38,0.04)),
  ("chain","Chain loops","steel","tube",(-0.2,0.33,0.05))]:
    C.append(comp(cid,name,"meso","drivetrain",prim,"assembled-solid","drivetrain part",(0.1,0.1,0.02),pos,mat,attach=att("drive-socket","drivetrain",pos,pos,"mount")))
C.append(comp("cockpit","Cockpit (integrated bar/stem)","macro","root","tube","assembled-solid","stem block + swept bar tube with drops",(0.30,0.15,0.42),(0.383,0.86,0),"cockpit-black",
  feats=[("top-cap","bevel","top cap + spacer stack"),("hoods","contour","two hood bodies + levers")],
  attach=att("steerer-top","fork",(0.375,0.85,0),(0.383,0.824,0)),anim="steer",pivot=(0.383,0.824,0),axis=(0.292,-0.956,0)))
C.append(comp("seatpost-saddle","Seatpost + saddle","macro","root","extrude","assembled-solid","aero post + clamp + saddle shell",(0.28,0.27,0.14),(-0.2,0.95,0),"carbon-black",
  feats=[("saddle-channel","hole","short-nose saddle with relief channel")],
  attach=att("seat-mast","frame",(-0.155,0.76,0),(-0.219,0.953,0),"insert",0.08)))
C.append(comp("saddle","Saddle shell","meso","seatpost-saddle","extrude","assembled-solid","lofted shell from top-profile outline",(0.26,0.03,0.14),(-0.21,0.99,0),"saddle-black",attach=att("rails","seatpost-saddle",(-0.219,0.96,0),(-0.21,0.985,0),"clamp")))
C.append(comp("bottle-bolt-set","Bottle bolts","micro","frame","cylinder","assembled-solid","instanced short cylinders",(0.008,0.004,0.008),(0.15,0.48,0.03),"steel",attach=att("tube-surface","frame",(0.15,0.48,0.025),(0.15,0.48,0.03),"embed",0.002)))
spec["componentTree"] = C

# ---------- materials ----------
def mat(mid, name, color, rough, metal=0.0, clearcoat=None, overrides=(), typ="physical"):
    m = copy.deepcopy(mtmpl)
    m.update(id=mid, name=name, type=typ, baseColor=color, color=color)
    m["albedo"] = dict(dominant=color, secondary=[color], samplingNotes="de-lit estimate from frameset/primary references")
    m["colorVariation"].update(palette=[color], pattern="flat-paint", amplitude=0.02)
    m["roughness"].update(base=rough, variation=0.05)
    m["metalness"].update(base=metal)
    if clearcoat is not None:
        m["clearcoat"] = clearcoat; m["clearcoatRoughness"] = 0.08
    m["localOverrides"] = [dict(id=o[0], region=o[1], albedo=o[2], roughness=o[3] if len(o)>3 else rough, evidenceRefs=["full-object"]) for o in overrides]
    return m
spec["materials"] = [
  mat("frame-white","Frame gloss off-white","#EDEBE6",0.28,clearcoat=1.0,overrides=[
    ("dt-wordmark","down tube decal from brand SVG","#A62A3A"),("tt-stripe","top tube 4-band stripe","#8E2533"),
    ("cs-stripe","chainstay 4-band stripe","#D4552E"),("bb-burgundy","BB shell","#8E2533"),
    ("fork-badge","fork badge band","#8E2533"),("cs-badge","chainstay badge","#8E2533"),
    ("clearcoat-gloss","global gloss lacquer","#EDEBE6",0.12)]),
  mat("carbon-black","Matte black carbon","#151515",0.55),
  mat("rim-carbon","Satin carbon rim","#0E0E0E",0.42),
  mat("tyre-rubber","Tyre rubber","#141414",0.85),
  mat("steel","Brushed steel","#9A9A9A",0.35,metal=1.0),
  mat("drivetrain-black","Anodised black alloy","#1A1A1A",0.45,metal=0.4),
  mat("cockpit-black","Bar tape / bar","#121212",0.75),
  mat("saddle-black","Saddle cover","#161616",0.7),
  mat("stripe-paints","Stripe paint palette","#B23B36",0.3,clearcoat=1.0),
]

spec["repetitionSystems"] = [
  dict(id="spokes", target="wheel-front", count=24, distribution="radial 2-cross", geometry="cylinder r=1mm", instances=48, buildsGeometry=True, realization="geometry"),
  dict(id="cassette-cogs", target="cassette", count=12, distribution="axial stack 10..33T", geometry="lathe ring", instances=12, buildsGeometry=True, realization="geometry"),
  dict(id="chain-links", target="chain", count=2, distribution="upper+lower run tube", geometry="tube", instances=2, buildsGeometry=True, realization="geometry"),
  dict(id="bottle-bolts", target="bottle-bolt-set", count=4, distribution="linear pairs DT/ST", geometry="cylinder", instances=4, buildsGeometry=True, realization="geometry"),
]

spec["featureReviewTargets"] = [
  dict(id="overall-silhouette", name="Wheel placement, frame triangle and saddle/bar heights", tier="critical", passIds=["blockout","structural-pass","form-refinement"], minimumScore=0.8, mustPass=True, componentRefs=["root","wheel-front","wheel-rear","frame"], evidenceRefs=["full-object"]),
  dict(id="dropped-stays-black-mast", name="Dropped seatstays into black aero seat tube/post", tier="critical", passIds=["structural-pass","form-refinement"], minimumScore=0.8, mustPass=True, componentRefs=["seat-tube","seatstays","seatpost-saddle"], evidenceRefs=["full-object"]),
  dict(id="retro-stripes-wordmark", name="4-band retro stripes + slanted DT wordmark", tier="critical", passIds=["material-pass","surface-pass"], minimumScore=0.75, mustPass=True, componentRefs=["frame"], evidenceRefs=["full-object"]),
  dict(id="deep-wheels", name="Deep carbon rims + tyres + spokes + rotors", tier="critical", passIds=["structural-pass","material-pass"], minimumScore=0.8, mustPass=True, componentRefs=["wheel-front","wheel-rear"], evidenceRefs=["full-object"]),
  dict(id="fork-cockpit", name="Curved tapered white fork + integrated black cockpit", tier="important", passIds=["form-refinement"], minimumScore=0.65, mustPass=False, componentRefs=["fork","cockpit"], evidenceRefs=["full-object"]),
  dict(id="drivetrain", name="Crankset, cassette, derailleurs, chain", tier="important", passIds=["form-refinement"], minimumScore=0.65, mustPass=False, componentRefs=["drivetrain"], evidenceRefs=["full-object"]),
]
spec["coordinateFrame"] = dict(front="+X (front wheel)", up="+Y", scaleReference="metres; wheel radius 0.343 m measured = 197 px at 579 px/m", side="+Z drive side")
spec["referenceCamera"].update(solved=True, fovDegrees=14.0, aspect=0.8, positionHint=[0,0.45,7.5], note="lab side preset; reference is near-orthographic studio profile")
spec["suitability"] = "pass"
spec["scores"] = dict(object_isolation=3, silhouette_readability=3, depth_inference=2, primitive_decomposition=3, material_procedurality=3, occlusion_risk=1, interaction_fit=3)
spec["silhouette"] = dict(boundingShape="1.69 x 1.01 m side footprint", aspectRatios=[1.67], symmetry="bilateral about XY except drivetrain (+Z)",
  dominantCurves=["two 0.686 m wheel circles","curved seat tube wheel cutout","fork rake curve","drop bar hooks"],
  negativeSpaces=["main triangle","rear triangle","spoke fields"], landmarks=[l for l in ["rear axle (-0.408,0.343)","BB (0,0.271)","front axle (0.584,0.343)","HT top (0.383,0.824)","saddle top ~1.0 m","bar tops ~0.9 m"]])
spec["performanceBudget"].update(targetTriangles=150000, maxDrawCalls=60, textureSize=1024, fpsTarget=60)
spec["assumptions"] = ["non-drive side mirrors drive side frame; brake calipers on -Z (rear 3/4 view confirms)",
  "tube cross-sections are truncated ellipses sized from rear 3/4 view (inferred, +-5 mm)",
  "chainring/cassette tooth counts approximated as smooth lathe rings with tooth rim"]
spec["preSpecAssessment"]["unknownsToResolveBeforeImplementation"] = []
spec["lightingFromPhoto"] = [
  dict(id="key", type="directional", direction="from camera-left high, soft (large softbox)", intensity=2.0, color="#FFFFFF", notes="lab preset key (2,3,4)"),
  dict(id="fill", type="hemisphere", sky="#FFFFFF", ground="#9A9A9A", intensity=0.6, notes="soft studio fill"),
  dict(id="rim", type="directional", direction="back-left", intensity=1.2, notes="separates dark tyres from background"),
  dict(id="environment", type="pmrem RoomEnvironment", notes="gloss clearcoat reflections; ACES filmic tone mapping, exposure 1.0"),
  dict(id="ground", type="contact shadow", notes="photo shows soft ground shadow under tyres; lab viewer has no ground plane, ambient occlusion from geometry only")]
for p in spec["buildPasses"]:
    p["componentRefs"] = [c["id"] for c in C if c["level"]=="macro"]
json.dump(spec, open(sys.argv[2],"w"), indent=2)
print("components", len(C), "materials", len(spec["materials"]))
