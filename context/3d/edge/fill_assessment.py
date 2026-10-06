import json,sys
p=sys.argv[1]; a=json.load(open(p)); ps=a['preSpecAssessment']
ps['objectClass']={"primaryType":"road racing bicycle (complete, rim-brake, carbon monocoque frame)","primaryDomain":"object",
 "formLanguage":["hard-surface","mechanical"],"structureKind":["compound object","articulated assembly","repeated modules"],
 "motionPotential":["articulated","detachable"],"materialFamilies":["plastic","metal","rubber"],
 "notes":"Observed from gen2 archive side view; ~40% occluded by rider. See analysis.md L8 for inferred regions."}
ps['complexity']['scores']={"silhouetteComplexity":3,"componentCount":3,"hierarchyDepth":2,"repetitionDensity":2,"materialLayerCount":2,"localDetailDensity":1,"occlusionRisk":3,"actionReadinessNeed":2}
ps['complexity']['estimatedCounts']={"macroComponents":7,"mesoComponents":30,"microFeatureGroups":8,"materialLayers":9,"repetitionSystems":3}
ps['complexity']['reasoning']=["Many visible subparts (frame tubes, fork, wheels, brakes, cockpit, drivetrain) with repeated spokes/chain links; rider occlusion forces inference."]
ps['unknownsToResolveBeforeImplementation']=[
 "crankset/chainrings/FD occluded by rider foot - inferred conventional 50/34 black compact (low confidence)",
 "rear derailleur/cassette mostly occluded - inferred 11sp black (low)",
 "saddle top shape and seat cluster junction under thigh - inferred (low)",
 "drop bar lower section and lever bodies partly occluded by hands - inferred (low)",
 "non-drive side hidden - mirrored from drive side (low)",
 "exact frame geometry - inferred from era size-54 road geometry (medium-low)"]
D=lambda i,k,z,d,ref,c: {"id":i,"kind":k,"zone":z,"description":d,"mapsTo":{"ref":ref},"confidence":c}
ps['detailInventory']['details']=[
 D("dt-wordmark","linework","down-tube","black 'vellum' wordmark along drive-side down tube, reading head tube to BB","down-tube/dt-wordmark","observed-high"),
 D("frame-gloss","gloss","frame","white gloss clearcoat frame paint","paint-white","observed-high"),
 D("tt-grey-band","stain","top-tube","mid-grey paint band across top tube mid-section","top-tube/tt-grey-band","observed-medium"),
 D("st-dark","stain","seat-tube","charcoal/black seat tube with light band near the top","seat-tube/st-light-band","observed-medium"),
 D("tyre-tanwall","stain","wheels","tan gum sidewall with black tread crown","tyre-tan","observed-high"),
 D("deep-rim","contour","wheels","~50 mm deep black carbon rim","rim","observed-high"),
 D("spokes","linework","wheels","thin black straight-pull spokes, ~18 front radial / ~24 rear","spokes","observed-medium"),
 D("calipers","fastener","brakes","silver dual-pivot rim calipers on fork crown and seat-stay bridge","brake-front","observed-high"),
 D("cable-loops","linework","cockpit","black housings looping from levers into frame ports","cable-housing","observed-medium"),
 D("bottle","contour","down-tube","black bottle cage + black bottle with red cap","bottle-cage","observed-medium"),
 D("fork-decal","linework","fork","small white decal near fork tip","fork/fork-decal","observed-low"),
 D("chainring","fastener","drivetrain","black compact crankset with chainring bolts","crankset","inferred-low")]
a['qualityContract']['definitionOfDone']=["Side render reads as white/black Gen2 Edge: white sharp-edged frame, black fork, black DT wordmark, grey TT band, dark seat tube/post, deep black rims with tan walls, silver rim calipers, black cockpit.",
 "Real scale metres, origin under BB, +X forward, named groups frame/fork/wheel-front/wheel-rear/drivetrain/cockpit/seatpost-saddle.",
 "<150k tris, few draw calls (shared materials, instanced/merged spokes and chain)."]
json.dump(a,open(p,'w'),indent=1)
