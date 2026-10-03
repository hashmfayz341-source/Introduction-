# Medical content review

## Scope and evidence

This is a source-grounded educational content review, not a claim of independent
clinical sign-off. All 28 supplied lecture pages were reviewed, including rendered
image diagrams that are absent from the text extraction. The 18-scene narration was
checked separately against the source before speech generation. The initial review
covers script and visual requirements; the encoded-frame review is recorded separately
after implementation so a script check is not mistaken for visual verification.

Primary source: AMS-HIS Pathology Team, *Cell Injury and Cell Death — Part I*, 28-page
supplied lecture. Fingerprint and page-by-page mapping are in `docs/source-coverage.md`.
The lecture cites *Robbins Pathology*, 10th edition, on pages 6 and 23. Standard
clarifications follow the framework in Kumar, Abbas and Aster, *Robbins & Cotran
Pathologic Basis of Disease*, 10th edition, chapter 2, “Cell Injury, Cell Death, and
Adaptations.” This reference is identified as established knowledge; it is not falsely
presented as a second supplied lecture or as a newly read complete textbook.

Additional authoritative checks consulted for specific clarifications:

- Pizzino et al., [*Oxidative Stress: Harms and Benefits for Human Health*](https://pmc.ncbi.nlm.nih.gov/articles/PMC5551541/), 2017.
  The open full text's introduction and oxidant/antioxidant sections were checked:
  ROS includes nonradical H2O2, and SOD, catalase and glutathione peroxidase have
  distinct roles. The review also distinguishes normal physiological ROS signaling
  from excessive ROS that damages lipids, proteins and nucleic acids.
- Bock and Tait, [*Mitochondria as multifaceted regulators of cell death*](https://doi.org/10.1038/s41580-019-0173-8), 2020.
  The indexed abstract was checked through Europe PMC (PMID 31636403), confirming
  outer mitochondrial membrane permeabilization → cytochrome-c release → caspases.
- Carraro and Bernardi, [*Measurement of membrane permeability and the mitochondrial permeability transition*](https://doi.org/10.1016/bs.mcb.2019.10.004), 2020.
  The indexed abstract was checked through Europe PMC (PMID 32183968), confirming
  permeability transition as increased **inner** membrane permeability. The video
  does not assign the transition pore an unsettled molecular composition.

## Corrections applied before animation and narration

| Topic | Lecture wording or diagram | Applied teaching decision |
|---|---|---|
| Permanent cells | “No growth even with stimulus” | Adult permanent cells have very limited proliferative capacity. Do not equate growth with division or claim no size change is possible. |
| Adaptive response | Names the four types | Define hypertrophy/atrophy as size changes, hyperplasia as cell-number increase in capable tissues, metaplasia as change of differentiated type. Workload-induced myocyte hypertrophy uses source page 6. |
| Insult duration | Removed → reversible; persistent → irreversible | Removal must precede irreversible injury. Very severe injury can become irreversible quickly; no universal minutes/hours threshold is taught. |
| Reversible membranes | “No membrane damage” | Reversible blebs and altered membranes are explicitly drawn on page 12. Teach preserved functional membrane integrity and nuclear viability, not absence of every structural change. |
| Hypoxia/ischemia | Both listed as oxygen deprivation | Hypoxia concerns oxygen supply; ischemia concerns blood flow, nutrients and waste clearance as well. A vessel clot is a source example, not the definition of all hypoxia. |
| ATP and calcium | Sodium pump failure → Ca/Na/water in same branch | Na/K pump failure disrupts sodium/potassium gradients and causes osmotic swelling. Cytosolic calcium increases through disturbed calcium regulation, extracellular entry and intracellular-store release; the Na/K ATPase is not animated importing calcium. |
| Glycolysis and DNA | Low pH → DNA and organelle damage on page 18 | Show glycogen use, lactate accumulation, reduced pH, altered enzymes and chromatin clumping. Do not draw acidosis as an obligatory direct DNA break. Radiation/chemicals/ROS and endonucleases supply the independent DNA-injury pathways. |
| Mitochondrial membranes | “Channels” causes ATP loss and cytochrome-c release | Keep inner membrane permeability transition/gradient failure/ATP depletion distinct from outer membrane permeabilization/cytochrome-c release/caspase apoptosis. They can coexist, but are not one universal channel. |
| ROS family | “ROS are O2 derived free radicals” | ROS includes radicals (superoxide/hydroxyl radical) and nonradical H2O2. Never put an unpaired-electron mark on every H2O2 molecule. |
| ROS damage | Emphasizes DNA in text; figure shows three targets | Show lipid peroxidation, protein oxidation/misfolding/breakdown, and DNA injury/mutations. ROS production/clearance is a balance, not a claim that all normal oxygen is damaging. |
| ROS detoxification | SOD/catalase text; detailed diagram adds GPx | SOD produces H2O2; catalase and glutathione peroxidase remove peroxide. Do not show SOD alone eliminating all oxidants. |
| Nonenzymatic list | Glutathione “in liver”; selenium and zinc listed with vitamins | Glutathione defense is not exclusive to liver. Selenium and zinc support enzyme/protein systems; do not animate each as a direct universal radical scavenger. Carotenoids and vitamins/flavonoids retain the source's explanatory scale. |
| Membrane injury | Detailed image adds lipid synthesis and cytoskeleton | Include reduced phospholipid synthesis, phospholipase breakdown and cytoskeletal proteolysis, not only visible holes. Lysosomal enzymes are released into cytoplasm after lysosomal injury. |
| Cell death | Necrosis/apoptosis branches; page 12 morphology | Teach representative necrotic swelling/leakage/inflammation and apoptotic shrinkage/fragments/clearance. Avoid implying every insult uses both patterns or that all nuclear condensation uniquely identifies apoptosis. |
| Genetic examples | “Mediterranean disease” | Preserve the source example without assigning a speculative disease identity or invented mechanism. |

## Medical review results: script and design requirements

- All eight cause categories and all six biochemical mechanisms are represented.
- Cell type, stress intensity/duration and adaptability remain visible determinants.
- ATP loss branches are parallel consequences, not an enforced long single sequence.
- Calcium enzyme classes map to their correct targets: phospholipases → membrane
  lipids; proteases → cellular/cytoskeletal proteins; endonucleases → DNA; ATPases →
  increased ATP consumption. Calcium also promotes mitochondrial dysfunction.
- Cytochrome-c release and caspase execution are not presented as requiring plasma
  membrane rupture. Apoptotic fragments remain membrane bounded during formation.
- ROS entry points include radiation, toxins and reperfusion from source page 23.
- A surviving swollen cell is visually distinguishable from a cell with membrane
  rupture, nuclear destruction and irreversible mitochondrial dysfunction.
- Definitions explain why an event matters; the video does not turn Part I into an
  unsupported full Part II course on every necrosis pattern or apoptosis pathway.

**Script review result:** PASS with the listed explicit clarifications. Narration
has 72 unique beat IDs and single-word anchors that appear in their spoken sentences.
The complete-source validation passed against the actual PDF fingerprint and all
28 page mappings. This does not yet certify an unseen render.

## Encoded visual review checkpoints

The final visual review must inspect actual rendered frames and transitions for:

1. Na/K transport and osmotic swelling, with calcium regulation kept separate.
2. ER/ribosome detachment and chromatin changes without implying irreversible death.
3. Distinct inner and outer mitochondrial membrane events.
4. ROS chemical identities and lipid/protein/DNA targets; sequential antioxidant handling.
5. Plasma versus lysosomal leakage, including correct destination of released enzymes.
6. Necrosis/apoptosis morphology and the same cell's recovery branch.

Record the encoded review and any fixes in `docs/qa.md` with frame evidence after
rendering. Until that evidence exists, encoded medical QA is **pending**, not passed.

## Independent implementation review

All four scene implementation files and reusable anatomy were reviewed against
the complete lecture. The independent pass inspected all **18 rendered scene
contact sheets, 90 representative states**, plus individual 1080p end states for
mitochondria, sodium-pump swelling and cell-death morphology. These are actual
Remotion-rendered stills, not assumptions drawn from code. The final encoded MP4
is a separate later check.

The initial stills correctly show:

- Normal-cell structural context including Golgi, peroxisome, centrioles and cytoskeleton.
- Cell size versus cell number versus epithelial phenotype replacement in adaptation.
- Preserved reversible membrane boundaries and nuclear viability versus irreparable rupture.
- Ischemic delivery loss leading to mitochondrial ATP depletion and normal-versus-failing pump transport.
- Na/K directions, osmotic water entry, ER swelling, reversible chromatin clumping and reduced protein synthesis.
- Distinct calcium enzyme targets and a labelled cytosol detail, without Na/K pump calcium transport.
- Two mitochondrial membranes and appropriate cytochrome-c movement from the intermembrane region into cytosol.
- Radical versus nonradical ROS identity, all three molecular target classes, and sequential enzymatic peroxide handling.
- Plasma leakage, mitochondrial failure and lysosomal digestive-enzyme release as distinct consequences.
- DNA repair versus caspase apoptosis; necrotic mitochondrial densities, lysosome rupture and nuclear fragmentation.
- Membrane-bounded apoptotic fragments and phagocytic clearance; the same swollen cell returning to balance.

The review identified and sent the following corrections to the implementing agents:

1. Separate apoptotic shrinkage, chromatin condensation, body formation and clearance
   at their actual spoken word cues; fade the parent cell as bodies form so material
   is not apparently duplicated. Applied in the reviewed initial scene stills/code.
2. Label recovery and persistent injury as conditional alternatives in the protein
   synthesis scene, avoiding green recovery arrows feeding unchanged injury labels.
   Applied in the reviewed initial scene stills/code.
3. Delay downward oxygen/phosphorylation labels until the actual decline rather than
   displaying them over the healthy baseline. Applied and verified in the corrected stills.
4. Replace three absent recap word cues (`branches`, `oxidative`, `membranes`) with
   words actually present in the narration (`Glycolysis`, `ROS`, `membrane`). Applied
   and verified against the real speech metadata and corrected stills.
5. Delay the right irreversible branch in Recovery until the spoken irreversible
   description, instead of the preceding reversible-bleb description. Applied and
   verified in corrected Recovery states; bottom failure/myelin labels are readable.
6. Place the mitochondrial outer-membrane leader precisely on its contour rather
   than the adjacent intermembrane space. Applied using the actual outer-contour
   Bézier point transformed by the same zoom as the organelle; final encoded frame
   check still required because this last leader edit followed the correction stills.

No additional incorrect biochemical mechanism or important unrepresented source
category was found. The corrected stills for Oxygen/Recovery/Recap/Calcium/Protein/
Death/Mitochondria and the additional pre-clearance apoptotic-body state were
inspected independently. **Corrected implementation medical review: PASS.**
All **64 literal internal word cues** in the four scene files match actual
synthesized word-boundary entries; no silent fallback is needed for these cues.
Final encoded-video verification remains pending until the completed MP4 is inspected.
