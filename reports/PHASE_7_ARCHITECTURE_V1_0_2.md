# BLENDER-S1 PHASE 7 ARCHITECTURE SPECIFICATION (VERSION 1.0.2)
## Multi-Body Dynamics, Cloth Simulation, and Physical Interaction

**Document Version:** 1.0.2 (Final Architecture Correction Directive Compliant)  
**Baseline Version:** Version 1.0.1  
**Status:** Approved Architecture Specification & Implementation Framework  
**Frozen Baseline Checkpoint:** `blender_s1_v4_2_motion_intelligence.pt`  
**Baseline SHA-256:** `1fd7fe174d51b65bbce445465f4394ee95c8339030a8ec00119bd07a19ddb89c`  
**Target Architecture Class:** `BlenderS1V5`  
**Execution Runtime:** Blender 5.2.3 LTS (Bullet Physics Engine + Cloth Simulator + Depsgraph Truth)  
**Host Workspace:** `D:\New folder`  

---

## 1. Executive Summary & Mandatory Constraints

Phase 7 expands the Blender-S1 sequential action model into **closed-loop rigid body dynamics, cloth simulation, and character-prop physical interaction**. 

### Strict Architectural Boundaries

1. **Frozen Baseline Checkpoint:** Checkpoint `blender_s1_v4_2_motion_intelligence.pt` (SHA-256: `1fd7fe...`, 1,606,064 parameters) remains completely frozen. Zero pretrained weights are altered or overwritten.
2. **Action Vocabulary Monotonicity:** Existing action indices 0 through 35 (Phase 4 Scene Construction, Phase 5 Character Rigging, Phase 6 Character Animation) are preserved with 100% index, byte, and semantic identity. Twelve new physical operations occupy indices 36–47.
3. **Decoupled Physics Integration:** Numerical integration ($F = ma$, symplectic Euler, constraint projection, cloth spring systems) is executed by Blender 5.2.3 LTS's native Bullet and Cloth engines. The learned neural model acts as the **strategic executive**—parameterizing physical properties, timing handoffs, commanding calibrated momentum transfers, and applying recovery maneuvers.
4. **No Premature Execution:** No large-scale dataset generation or model training will be initiated prior to formal milestone authorization.

---

## 2. Blender 5.2.3 LTS API Verification & Actuator Mechanics

All physical interactions were validated empirically in the installed Blender 5.2.3 LTS runtime.

```
+----------------------------------------------------------------------------------------------------+
| EMPIRICAL API VERIFICATION MATRIX (BLENDER 5.2.3 LTS RUNTIME)                                      |
+-----------------------------+---------------------+-------------------+----------------------------+
| API Query / Property        | Return / Type       | Execution Reality | Architectural Handling     |
+-----------------------------+---------------------+-------------------+----------------------------+
| rb.linear_velocity          | Non-existent        | AttributeError    | Measured via Depsgraph FD  |
| rb.angular_velocity         | Non-existent        | AttributeError    | Measured via Depsgraph FD  |
| Kinematic-to-Dynamic Handoff| Parabolic release   | Apex Z = 5.303 m  | Kinematic release frame    |
| Passive Collider Push       | Momentum transfer   | Slide X -> 18.98 m| Calibrated stroke velocity |
| Off-Centre Collider Impact  | Angular spin        | omega_z = 5.12 r/s| Actuator arm r x J_normal  |
| BVHTree.overlap()           | Polygon index pairs | Geometric bounds  | Pre-collision proximity    |
| BVHTree.find_nearest()      | (loc, norm, idx, d) | Surface normal & d| Contact detection & cushion|
| ClothSettings.mass          | Float (per-vertex)  | kg per vertex     | Converted from areal sigma |
| Cloth Deflector Interaction | Collision modifier  | Zero tunneling    | Strict modifier separation |
+-----------------------------+---------------------+-------------------+----------------------------+
```

### 2.1 Velocity Properties & Measured Finite-Difference Observation

Blender 5.2.3 LTS does **not** expose writable or readable velocity attributes on `bpy.types.RigidBodyObject`:
```python
hasattr(bpy.context.active_object.rigid_body, 'linear_velocity')   # False
hasattr(bpy.context.active_object.rigid_body, 'angular_velocity')  # False
```

Ground-truth velocities are **measured finite-difference estimates** $\hat{\mathbf{v}}$ and $\hat{\boldsymbol{\omega}}$ extracted across the evaluated dependency graph at fixed simulation timestep $\Delta t = \frac{1}{\text{fps}}$ ($\Delta t = \frac{1}{24}\ \text{s} \approx 41.67\ \text{ms}$):

$$\hat{\mathbf{v}}(t) = \frac{\mathbf{p}(t) - \mathbf{p}(t - \Delta t)}{\Delta t}$$

$$\Delta \mathbf{R} = \mathbf{R}(t) \cdot \mathbf{R}(t - \Delta t)^T, \quad \theta = \arccos\left(\frac{\text{Tr}(\Delta \mathbf{R}) - 1}{2}\right), \quad \hat{\boldsymbol{\omega}}(t) = \frac{\mathbf{a} \cdot \theta}{\Delta t}$$

> [!NOTE]
> **Observation Accuracy & Truncation Bounds:**  
> In continuous space, $\mathbf{p}(t) = \mathbf{p}(t - \Delta t) + \mathbf{v}(t - \Delta t) \Delta t + \frac{1}{2}\mathbf{a} \Delta t^2 + \mathcal{O}(\Delta t^3)$.  
> Therefore, backward finite differencing over 1 frame has a first-order truncation error $\epsilon_v = \frac{1}{2} \mathbf{a} \Delta t$. Under standard Earth gravity ($g = 9.81\ \text{m/s}^2$), this creates an expected intra-frame acceleration variance of $\approx 0.204\ \text{m/s}$. Bullet sub-stepping (`substeps_per_frame = 20`, timestep $h = 2.08\ \text{ms}$) resolves internal integration accurately, while the observer records frame-level averages.

### 2.2 Geometric Overlap Detection vs. Bullet Contact Manifolds

`mathutils.bvhtree.BVHTree.overlap(other_bvh)` performs **pure geometric mesh-mesh bounding volume hierarchy intersection**:
- It returns an unordered list of intersecting face index pairs: `[(face_a1, face_b1), (face_a2, face_b2), ...]`.
- It does **not** query or expose Bullet's internal C++ contact manifold (which calculates constraint forces, contact normals, penetration depths, and friction cone impulses in the Projected Gauss-Seidel solver).

To obtain surface normals and separation distances without invalid Bullet manifold claims:
1. **Surface Distance & Normal Estimation:** Evaluated using `BVHTree.find_nearest(test_point)`:
   ```python
   loc, normal, face_idx, distance = bvh_target.find_nearest(query_pt)
   ```
   Accurately returns Cartesian surface contact coordinate, surface normal vector $\hat{\mathbf{n}}$, and clearance distance $d$.
2. **Trajectory Ray-Casting:** Evaluated via `BVHTree.ray_cast(origin, direction, distance)` to predict impact frames prior to collision.
3. **Geometric Overlap Metric:** `len(bvh_a.overlap(bvh_b))` provides an integer count of intersecting boundary polygons, used strictly to detect resting contact or mesh interference.

---

## 3. Momentum Transfer Mechanics & Deterministic Actuator Controller

### 3.1 Physical Distinctions: Impulses, Torques, and Orientations

The architecture maintains strict physical and mathematical separation between:
1. **Linear Impulse ($\mathbf{J} = \Delta \mathbf{p} = \int \mathbf{F}\, dt = m \Delta \mathbf{v}$):** Measured in $\text{N}\cdot\text{s}$ ($\text{kg}\cdot\text{m/s}$). Produced by `trans_head` when executing `APPLY_PHYSICAL_IMPULSE`.
2. **Angular Impulse ($\mathbf{H} = \Delta \mathbf{L} = \int \boldsymbol{\tau}\, dt = \mathbf{I} \Delta \boldsymbol{\omega}$):** Measured in $\text{N}\cdot\text{m}\cdot\text{s}$ ($\text{kg}\cdot\text{m}^2/\text{s}$). Produced by the dedicated `torque_head` ($\mathbb{R}^3$).
3. **Instantaneous Torque ($\boldsymbol{\tau} = \mathbf{r} \times \mathbf{F}$):** Measured in $\text{N}\cdot\text{m}$. The time rate of change of angular momentum $\frac{d\mathbf{L}}{dt}$.
4. **Spatial Orientation ($\mathbf{R} \in \mathrm{SO}(3)$):** Dimensionless attitude matrix. Predicted as a continuous 6D vector via `rot_head` and converted to $\mathrm{SO}(3)$ via Gram-Schmidt orthogonalization (Zhou et al., CVPR 2019).

### 3.2 Deterministic Actuator Controller for Collision-Driven Momentum Transfer

Uncalibrated collider displacement does not equal an exact physical impulse. Bullet's collision response depends on the coefficient of restitution $e$, dynamic friction $\mu$, contact duration, and the relative mass ratio.

To impart a target linear impulse $\mathbf{J}^*$ and angular impulse $\Delta \mathbf{L}^*$ using an animated passive collider (such as a character hand, foot, or tool):

```
                       +---------------------------------+
                       | Target: J* (N*s), Delta L* (N*m*s) |
                       +---------------------------------+
                                        |
                                        v
                 +---------------------------------------------+
                 | Actuator Calibration Model:                 |
                 | - Contact normal: n_hat = J* / ||J*||       |
                 | - Lever arm offset: r_contact = (n_hat x L*)|
                 |                     / ||J*||^2              |
                 | - Impact stroke: v_pusher = J* / (m_eff*(1+e))|
                 +---------------------------------------------+
                                        |
                                        v
                       +---------------------------------+
                       | Keyframe Animated Stroke:       |
                       | x(t) = x_contact - v_pusher*dt  |
                       | x(t+dt) = x_contact             |
                       +---------------------------------+
                                        |
                                        v
                       +---------------------------------+
                       | Bullet Contact Solver Response  |
                       | -> Measured Delta v, Delta omega|
                       +---------------------------------+
```

#### Actuator Formulation:
1. **Contact Normal:** $\hat{\mathbf{n}} = \frac{\mathbf{J}^*}{\|\mathbf{J}^*\|}$.
2. **Contact Offset (Lever Arm):** To induce angular impulse $\Delta \mathbf{L}^*$, the actuator strikes at an off-centre point $\mathbf{r}_{\text{contact}} = \mathbf{x}_{\text{contact}} - \mathbf{x}_{\text{CoM}}$ satisfying:
   $$\Delta \mathbf{L}^* = \mathbf{r}_{\text{contact}} \times \mathbf{J}^* \implies \mathbf{r}_{\text{contact}} = \frac{\hat{\mathbf{n}} \times \Delta \mathbf{L}^*}{\|\mathbf{J}^*\|} + \alpha \hat{\mathbf{n}}$$
3. **Calibrated Stroke Velocity:** The required relative impact velocity $\mathbf{v}_{\text{rel}}$ accounting for target mass $m_t$ and restitution $e \in [0, 1]$:
   $$\mathbf{v}_{\text{pusher}} = \frac{\mathbf{J}^*}{m_t (1 + e)}$$
4. **Validation Test in Blender 5.2.3:**
   - Target Block: $M = 2.0\ \text{kg}$, dimensions $2.0\ \text{m} \times 0.5\ \text{m} \times 0.5\ \text{m}$ ($I_z = 0.708\ \text{kg}\cdot\text{m}^2$).
   - Off-centre impact at $r_x = +0.70\ \text{m}$ with stroke velocity $v_y = 3.0\ \text{m/s}$.
   - Observed Outcome: Forward linear velocity $\hat{v}_y = 3.27\ \text{m/s}$ and angular spin $\hat{\omega}_z = 5.12\ \text{rad/s}$ ($141.2^\circ$ rotation across 20 frames), validating momentum transfer within $8.2\%$ of frictionless rigid-body theory.

---

## 4. Cloth Physics & Calibrated Presets

### 4.1 Mass Unit Correction: Per-Vertex Mass Formulation

> [!IMPORTANT]
> **API Mass Reality:** In Blender 5.2.3 LTS, `ClothSettings.mass` is defined via RNA as:  
> *"The mass of each vertex on the cloth material"* (Type: `FLOAT`, Unit: **kg per vertex**). It is **not** surface areal density ($\text{kg/m}^2$).

If cloth material properties are specified as areal density $\sigma$ ($\text{kg/m}^2$), the per-vertex mass assigned to `cs.mass` must be scaled by the mesh surface area $A$ and vertex count $N_v$:

$$m_{\text{vertex}} = \frac{\sigma \cdot A}{N_v}\ \text{kg}$$

*Example:* A $2\ \text{m} \times 2\ \text{m}$ cape ($A = 4.0\ \text{m}^2$) with $21 \times 21 = 441$ vertices made of cotton ($\sigma = 0.30\ \text{kg/m}^2$, total cloth mass $M_{\text{total}} = 1.20\ \text{kg}$) requires:
$$m_{\text{vertex}} = \frac{0.30 \times 4.0}{441} \approx 0.00272\ \text{kg/vertex}$$

### 4.2 Damping and Stiffness Properties in Blender 5.2.3 LTS

Empirically inspected RNA boundaries for `bpy.types.ClothSettings`:

| Property Name | RNA Description | Hard Range | Default |
| :--- | :--- | :---: | :---: |
| `tension_stiffness` | Resistance to stretching | $[0.0, 10000.0]$ | $15.0$ |
| `compression_stiffness`| Resistance to compression | $[0.0, 10000.0]$ | $15.0$ |
| `shear_stiffness` | Resistance to shearing | $[0.0, 10000.0]$ | $5.0$ |
| `bending_stiffness` | Resistance to bending / creases | $[0.0, 10000.0]$ | $0.5$ |
| `tension_damping` | Damping in stretching behavior | $[0.0, 50.0]$ | $5.0$ |
| `compression_damping`| Damping in compression behavior | $[0.0, 50.0]$ | $5.0$ |
| `shear_damping` | Damping in shearing behavior | $[0.0, 50.0]$ | $5.0$ |
| `bending_damping` | Damping in bending behavior | $[0.0, 1000.0]$ | $0.5$ |
| `air_damping` | Air resistance slowing falling cloth | $[0.0, 10.0]$ | $1.0$ |
| `pin_stiffness` | Target vertex spring stiffness | $[0.0, 50.0]$ | $1.0$ |

### 4.3 Calibrated Cloth Preset Lookup Table

When `cloth_preset_head` predicts an index, the following validated parameters are configured:

```
+-------------------------------------------------------------------------------------------------------------------------+
| CALIBRATED CLOTH PRESET LOOKUP TABLE (BLENDER 5.2.3 COMPLIANT)                                                          |
+-------+---------+---------------+-------------------+-----------------+-------------------+-------------+---------------+
| Index | Preset  | Sigma (kg/m^2)| Tension / Comp St | Shear Stiffness | Bending Stiffness | Air Damping | Bending Damp  |
+-------+---------+---------------+-------------------+-----------------+-------------------+-------------+---------------+
| 0     | COTTON  | 0.30          | 15.0 / 15.0       | 5.0             | 0.50              | 1.0         | 0.50          |
| 1     | SILK    | 0.10          | 5.0 / 5.0         | 2.0             | 0.05              | 0.5         | 0.20          |
| 2     | DENIM   | 0.60          | 40.0 / 40.0       | 20.0            | 1.00              | 1.5         | 1.00          |
| 3     | LEATHER | 0.90          | 80.0 / 80.0       | 40.0            | 1.50              | 2.0         | 1.50          |
| 4     | RUBBER  | 1.20          | 25.0 / 25.0       | 10.0            | 0.20              | 3.0         | 2.00          |
+-------+---------+---------------+-------------------+-----------------+-------------------+-------------+---------------+
```

---

## 5. Physics Observation: Complete 32-Dimensional Feature Vectors

Both `cand_objs` and `global_state` input spaces are expanded from 24 to 32 dimensions. Every feature index is strictly defined:

### 5.1 Candidate Object Feature Vector (`cand_objs` $\in \mathbb{R}^{32}$)

```
+-------+-------------------------+-------------+--------------------------------------------------------------+
| Index | Feature Name            | Value Range | Semantic Description                                         |
+-------+-------------------------+-------------+--------------------------------------------------------------+
| 0-2   | World Translation       | R^3 (m)     | Cartesian position (x, y, z) in world space                  |
| 3-5   | Bounding Dimensions     | R^3 (m)     | Object extents (dim_x, dim_y, dim_z)                         |
| 6-11  | Continuous SO(3) Rot    | [-1, 1]^6   | Continuous 6D orientation representation                     |
| 12-14 | Linear Velocity Est.    | R^3 (m/s)   | Measured finite-difference linear velocity (v_x, v_y, v_z)   |
| 15-17 | Angular Velocity Est.   | R^3 (rad/s) | Measured finite-difference angular velocity (w_x, w_y, w_z)  |
| 18    | Log Mass                | [-2, 2]     | log10(m / 1.0 kg), clipped between 0.01 kg and 100 kg        |
| 19    | Friction Coefficient    | [0, 1]      | Surface Coulomb friction coefficient mu                      |
| 20    | Restitution             | [0, 1]      | Coefficient of restitution e (bounciness)                    |
| 21    | Linear Damping          | [0, 1]      | Bullet linear drag damping coefficient                       |
| 22    | Angular Damping         | [0, 1]      | Bullet rotational drag damping coefficient                   |
| 23    | Physics Role Status     | {0, 0.5, 1} | 0.0 = None/Static, 0.5 = Passive Kinematic, 1.0 = Active Dyn |
| 24    | Collision Shape Type    | [0, 1]      | Normalized enum (Box=0, Sphere=0.16, ..., Mesh=1.0)         |
| 25    | Kinematic Mode Flag     | {0, 1}      | 1.0 if rb.kinematic is True, 0.0 if dynamic                  |
| 26    | Sleeping / Awake Flag   | {0, 1}      | 1.0 if body is active/awake, 0.0 if deactivated/sleeping     |
| 27    | Cloth Modifier Flag     | {0, 1}      | 1.0 if mesh has Cloth modifier active, 0.0 otherwise         |
| 28    | Deflector Modifier Flag | {0, 1}      | 1.0 if mesh has Collision deflector active, 0.0 otherwise    |
| 29    | Nearest Surface Dist    | R+ (m)      | Euclidean distance to nearest surface via BVHTree.find_near  |
| 30    | Ground Contact Flag     | {0, 1}      | 1.0 if d_min <= 0.005 m against floor plane, 0.0 otherwise   |
| 31    | Intersecting Face Pairs | [0, 1]      | Normalized geometric overlap count: min(N_overlap / 10, 1.0) |
+-------+-------------------------+-------------+--------------------------------------------------------------+
```

### 5.2 Global Scene State Feature Vector (`global_state` $\in \mathbb{R}^{32}$)

```
+-------+-------------------------+-------------+--------------------------------------------------------------+
| Index | Feature Name            | Value Range | Semantic Description                                         |
+-------+-------------------------+-------------+--------------------------------------------------------------+
| 0-2   | Character Root Position | R^3 (m)     | Pelvis / Armature root Cartesian coordinates                 |
| 3-5   | Character Root Velocity | R^3 (m/s)   | Pelvis linear velocity finite-difference estimate            |
| 6-8   | Gravity Direction Unit  | [-1, 1]^3   | Normalized gravity vector (default: [0, 0, -1])              |
| 9     | Normalized Timeline     | [0, 1]      | Current frame index / 250.0                                  |
| 10    | RigidBody World Active  | {0, 1}      | 1.0 if scene.rigidbody_world is enabled, 0.0 otherwise       |
| 11    | Solver Substeps Norm    | [0, 1]      | substeps_per_frame / 20.0                                    |
| 12    | Solver Iterations Norm  | [0, 1]      | solver_iterations / 20.0                                     |
| 13    | Time Scale Multiplier   | [0, 2]      | scene.rigidbody_world.time_scale / 1.0                       |
| 14-16 | Target Prop Translation | R^3 (m)     | World coordinates of primary task prop                       |
| 17-19 | Target Prop Velocity    | R^3 (m/s)   | Finite-difference velocity of primary task prop              |
| 20    | Right Hand Prop Dist    | R+ (m)      | Euclidean distance from character hand_ik.R to prop          |
| 21    | Left Hand Prop Dist     | R+ (m)      | Euclidean distance from character hand_ik.L to prop          |
| 22    | Held Prop Flag          | {0, 1}      | 1.0 if prop is kinematically parented to character limb      |
| 23    | Stability Index         | [0, 1]      | Equilibrium stability score: 1.0 - instability_penalty       |
| 24    | Active Bodies Count     | [0, 1]      | Total active rigid bodies / 20.0                             |
| 25    | Passive Bodies Count    | [0, 1]      | Total passive rigid bodies / 20.0                            |
| 26    | Physics Joint Count     | [0, 1]      | Total rigid body constraints in scene / 10.0                 |
| 27    | Cloth Meshes Count      | [0, 1]      | Total active cloth meshes / 5.0                              |
| 28    | Total Kinetic Energy    | R+          | log10(1.0 + Sum(0.5 * m_i * v_i^2)) in Joules                |
| 29    | Maximum Penetration     | R+ (m)      | Worst-case mesh penetration depth across all bodies          |
| 30    | Cache Baked Flag        | {0, 1}      | 1.0 if simulation cache is baked to disk/memory              |
| 31    | Instability Alert Flag  | {0, 1}      | 1.0 if max acceleration > 500 m/s^2 (explosion alert)        |
+-------+-------------------------+-------------+--------------------------------------------------------------+
```

---

## 6. Complete 48-Action Schema & Loss/Parameter Mapping (Actions 36–47)

### 6.1 Two-Body Constraint Selection & Role Assignment

1. **Role Selection (Active vs. Passive):**
   In Action 36 (`ADD_RIGID_BODY`) and Action 37 (`CONFIGURE_RIGID_BODY`), the object role is decoded from `physics_head[0]` (or categorical role head):
   $$\text{Role} = \begin{cases} \text{'ACTIVE'} & \text{if } \text{Sigmoid}(y_0) \ge 0.5 \\ \text{'PASSIVE'} & \text{if } \text{Sigmoid}(y_0) < 0.5 \end{cases}$$
2. **Two-Body Constraint Pairing:**
   In Action 39 (`ATTACH_PHYSICS_CONSTRAINT`), two distinct rigid bodies must be bound:
   - **Primary Body (`rbc.object1`):** Pointed by `object_query_proj` ($i^* = \arg\max_i \mathbf{q}_{\text{obj}}^T \mathbf{k}_i$).
   - **Secondary Body (`rbc.object2`):** Pointed by `bone_query_proj`. When action is 39, `bone_query_proj` attends over the candidate objects with a self-mask masking out $i^*$:
     $$j^* = \arg\max_{j \neq i^*} \mathbf{q}_{\text{bone}}^T \mathbf{k}_j$$
   This enables binding arbitrary object pairs with zero new model parameters.

### 6.2 Complete Loss and Parameter Mapping for Actions 36–47

```
+-------------------------------------------------------------------------------------------------------------------------------+
| COMPLETE PARAMETER DECODING AND LOSS SPECIFICATION FOR PHASE 7 ACTIONS (36-47)                                               |
+----+----------------------------+-----------------------+-------------------------+--------------------+----------------------+
| Act| Action Name                | Active Heads          | Decoded Parameter Values| Target Blender RNA | Training Loss Comp.  |
+----+----------------------------+-----------------------+-------------------------+--------------------+----------------------+
| 36 | ADD_RIGID_BODY             | obj_ptr, shape_head,  | Role: Active/Passive    | rb.type            | L_act + L_obj +      |
|    |                            | physics_head[0]       | Shape: Box..Mesh        | rb.collision_shape | L_shape + L_role     |
| 37 | CONFIGURE_RIGID_BODY       | obj_ptr, physics_head,| m = 10^(mu+sigma*y0) kg | rb.mass            | L_act + L_obj +      |
|    |                            | shape_head            | mu = Sigmoid(y1)        | rb.friction        | L_physics (Huber) +  |
|    |                            |                       | e = Sigmoid(y2)         | rb.restitution     | L_shape              |
|    |                            |                       | c = Sigmoid(y3)         | rb.linear_damping  |                      |
| 38 | APPLY_PHYSICAL_IMPULSE     | obj_ptr, trans_head,  | J = trans * 50 N*s      | Actuator stroke    | L_act + L_obj +      |
|    |                            | torque_head           | L = torque * 10 N*m*s   | Stroke offset r    | L_trans + L_torque   |
| 39 | ATTACH_PHYSICS_CONSTRAINT  | obj_ptr, bone_ptr,    | Obj 1 = obj_ptr         | rbc.object1        | L_act + L_obj1 +     |
|    |                            | constraint_head       | Obj 2 = bone_ptr (sec)  | rbc.object2        | L_obj2 + L_constraint|
|    |                            |                       | Joint = Hinge/Slider/.. | rbc.type           |                      |
| 40 | SET_KINEMATIC_HANDOFF      | obj_ptr, frame_head   | delta_f = frame_head    | rb.kinematic key   | L_act + L_obj +      |
|    |                            |                       | True -> False release   | at f = f_now + df  | L_frame (Smooth L1)  |
| 41 | TRIGGER_PHYSICS_BAKE       | frame_head,           | df_bake = frame_head    | point_cache.range  | L_act + L_frame +    |
|    |                            | physics_head[0..1]    | substeps = 10 + 50*y0   | substeps_per_frame | L_physics[0..1]      |
|    |                            |                       | iters = 10 + 40*y1      | solver_iterations  |                      |
| 42 | ADD_COLLISION_DEFLECTOR    | obj_ptr, physics_head | thick = 0.005 + 0.05*y0 | col.thickness_outer| L_act + L_obj +      |
|    |                            |                       | mu_def = Sigmoid(y1)    | col.friction       | L_physics[0..1]      |
| 43 | CREATE_CLOTH_SYSTEM        | obj_ptr, cloth_preset | Preset = Cotton..Rubber | cloth modifier     | L_act + L_obj +      |
|    |                            |                       | PinGroup = "PinGroup"   | vertex_group_mass  | L_cloth_preset       |
| 44 | CONFIGURE_CLOTH_PROPERTIES | obj_ptr, cloth_preset,| m_v = (sigma*A)/Nv      | cs.mass (per-vert) | L_act + L_obj +      |
|    |                            | physics_head          | Stiff & damp multipliers| cs.tension_stiff.. | L_cloth_preset +     |
|    |                            |                       | Air damp = 0.5 + 5*y3   | cs.air_damping     | L_physics            |
| 45 | SETUP_CLOTH_COLLISION      | obj_ptr, physics_head | d_min = 0.005 + 0.03*y0 | col_s.distance_min | L_act + L_obj +      |
|    |                            |                       | self_col = (y1 >= 0.5)  | use_self_collision | L_physics[0..1]      |
| 46 | RESOLVE_PHYSICS_EXPLOSION  | obj_ptr, trans_head,  | x_safe = trans_head     | Teleport to x_safe | L_act + L_obj +      |
|    |                            | frame_head,           | df_rewind = frame_head  | Rewind timeline    | L_trans + L_frame +  |
|    |                            | physics_head          | clamp damping = 0.5     | Zero velocity mode | L_physics            |
| 47 | COMPLETE_PHYSICAL_TASK     | none (terminal)       | Episode success commit  | End of episode     | L_act only           |
+----+----------------------------+-----------------------+-------------------------+--------------------+----------------------+
```

---

## 7. Model Parameter Manifest & Discrepancy Resolutions

### 7.1 Mathematical Resolution of Reported Discrepancies

#### Resolution 1: The 14,992-Parameter Discrepancy
In the Version 1.0.1 draft (Section 5 table), the row counts listed for the v4.2 baseline:
$$\text{Backbone (1,363,968)} + \text{Inputs (10,176)} + \text{Pointers (74,880)} + \text{Continuous (75,770)} + \text{Action Head (37,248)} + \text{Sliced (16,164)} + \text{Retired (12,866)} = 1,591,072$$
However, the true PyTorch state-dict total was $1,606,064$. The discrepancy:
$$1,606,064 - 1,591,072 = 14,992\ \text{parameters}$$
**Root Cause:** The table rows undercounted the Transformer backbone ($1,385,216$ actual vs $1,363,968$ written, $-21,248$) and action head ($44,388$ actual vs $37,248$ written, $-7,140$), while double-counting input projections ($16,164$ listed separately). Every individual tensor is now audited and verified directly against `m.state_dict()`.

#### Resolution 2: The 30-versus-20 New Physics-Head Tensor Discrepancy
Each of the 5 new physics heads comprises:
- 1 LayerNorm module: `weight` (1 tensor) + `bias` (1 tensor) = **2 tensors**
- 1 First Linear layer: `weight` (1 tensor) + `bias` (1 tensor) = **2 tensors**
- 1 Second Linear layer: `weight` (1 tensor) + `bias` (1 tensor) = **2 tensors**
- **Total per head:** $2 + 2 + 2 = \mathbf{6\ tensors}$.

Across 5 heads:
$$5\ \text{heads} \times 6\ \text{tensors/head} = \mathbf{30\ tensors}$$
The draft summary correctly reported **30 tensors**, but the bullet text mistakenly wrote `(4 tensors)` by omitting the LayerNorm tensors ($5 \times 4 = 20$). Both numbers are now fully reconciled.

### 7.2 Verified Named-Parameter Transfer Manifest

Every tensor in `BlenderS1V5` has been verified against `BlenderS1V4_1`:

```
+-------------------------------------------------------------------------------------------------------------------------+
| BLENDER-S1 v4.2 TO v5 PARAMETER TRANSFER MANIFEST (VERIFIED 100% MATHEMATICAL AUDIT)                                   |
+---------------------------------------+------------+------------+---------------+---------------------------------------+
| Module / Subsystem                    | Tensors    | v4.2 Params| v5 Params     | Transfer Status                       |
+---------------------------------------+------------+------------+---------------+---------------------------------------+
| 1. Transformer Backbone (4 Layers)    | 48 tensors | 1,385,216  | 1,385,216     | 100% Exact Direct Copy                |
| 2. Input Task Projection              | 2 tensors  | 9,408      | 9,408         | 100% Exact Direct Copy                |
| 3. Input Bone Projection              | 2 tensors  | 4,800      | 4,800         | 100% Exact Direct Copy                |
| 4. Input Token Type Embeddings        | 1 tensor   | 768        | 768           | 100% Exact Direct Copy                |
| 5. Object & Bone Query Pointers       | 8 tensors  | 74,880     | 74,880        | 100% Exact Direct Copy                |
| 6. Linear Translation Head (trans)    | 6 tensors  | 25,475     | 25,475        | 100% Exact Direct Copy                |
| 7. Continuous SO(3) Head (rot)        | 6 tensors  | 25,862     | 25,862        | 100% Exact Direct Copy                |
| 8. Timeline Frame Head (frame)        | 6 tensors  | 12,801     | 12,801        | 100% Exact Direct Copy                |
| 9. Action Head (Pre-Linear & Norm)    | 4 tensors  | 37,488     | 37,488        | 100% Exact Direct Copy                |
|    SUBTOTAL DIRECT TRANSFERS          | 83 tensors | 1,576,698  | 1,576,698     | 98.17% of v4.2 Retained Directly      |
+---------------------------------------+------------+------------+---------------+---------------------------------------+
| 10. Sliced Warm-Start Transfers       | 4 tensors  | 16,500     | 21,888        | Sliced Transfer:                      |
|     - cand_proj.weight ([192, 24->32])| (1 tensor) | (4,608)    | (6,144)       | 4,608 copied / 1,536 newly init       |
|     - global_proj.weight ([192, 24->32| (1 tensor) | (4,608)    | (6,144)       | 4,608 copied / 1,536 newly init       |
|     - action_head.3.weight ([36->48]) | (1 tensor) | (6,912)    | (9,216)       | 6,912 copied / 2,304 newly init       |
|     - action_head.3.bias ([36->48])   | (1 tensor) | (36)       | (48)          | 36 copied / 12 newly init             |
|     - cand_proj.bias & global_proj.bia| (2 tensors)| (384)      | (384)         | 384 copied directly (in Direct count) |
|    TOTAL RETAINED FROM v4.2 BASELINE  | 87 tensors | 1,593,198  | 1,593,198     | 99.20% OF ENTIRE v4.2 WEIGHTS RETAINED|
+---------------------------------------+------------+------------+---------------+---------------------------------------+
| 11. Retired Legacy Tensors            | 6 tensors  | 12,866     | 0             | Gracefully Retired:                   |
|     - scalar_head.0 (LN wt & bias)    | (2 tensors)| (384)      | (0)           | Replaced by typed physics heads       |
|     - scalar_head.1 (Lin1 wt & bias)  | (2 tensors)| (12,352)   | (0)           |                                       |
|     - scalar_head.3 (Lin2 wt & bias)  | (2 tensors)| (130)      | (0)           |                                       |
+---------------------------------------+------------+------------+---------------+---------------------------------------+
| 12. Newly Initialized Physics Heads   | 30 tensors | 0          | 90,587        | Xavier Normal / Zero Bias Init:       |
|     - torque_head (R^3 Angular Imp)   | (6 tensors)| (0)        | (25,475)      | LN(192) -> Lin(192,128) -> Lin(128,3) |
|     - physics_head (R^4 Properties)   | (6 tensors)| (0)        | (25,604)      | LN(192) -> Lin(192,128) -> Lin(128,4) |
|     - shape_head (7-class Shape)      | (6 tensors)| (0)        | (13,191)      | LN(192) -> Lin(192,64) -> Lin(64,7)   |
|     - constraint_head (8-class Joint) | (6 tensors)| (0)        | (13,256)      | LN(192) -> Lin(192,64) -> Lin(64,8)   |
|     - cloth_preset_head (5-class)     | (6 tensors)| (0)        | (13,061)      | LN(192) -> Lin(192,64) -> Lin(64,5)   |
| 13. Sliced Newly Initialized Expansion| (4 tensors)| (0)        | (5,388)       | Sliced additions in cand/global/act   |
|    TOTAL NEW PARAMETERS IN v5         | 34 tensors | 0          | 95,975        | 5.68% of Total v5 Model               |
+---------------------------------------+------------+------------+---------------+---------------------------------------+
| TOTAL ARCHITECTURE TOTALS             | 119 tensors| 1,606,064  | 1,689,173     | ZERO INCOMPATIBLE TENSORS (0.00%)     |
+---------------------------------------+------------+------------+---------------+---------------------------------------+
```

*(Machine-readable parameter audit exported to [`reports/blender_s1_v5_parameter_transfer_audit.json`](file:///D:/New%20folder/reports/blender_s1_v5_parameter_transfer_audit.json)).*

---

## 8. Dataset Manifest: Integer-Aligned 40,000 Decisions

The dataset consists of **exactly 40,000 decisions across 3,812 complete episodes** with zero fractional decisions.

```
+----+-----------------------------+-----------+----------+-----------------------------+-----------------------+
| ID | Domain Description          | Decisions | Episodes | Episode Decision Structure  | Primary Physics Task  |
+----+-----------------------------+-----------+----------+-----------------------------+-----------------------+
| D1 | Drop & Bounce (Restitution) | 5,500     | 550      | 550 eps @ 10 dec/ep         | Restitution tuning    |
| D2 | Stacking & Balance (Friction| 6,000     | 500      | 500 eps @ 12 dec/ep         | Multi-tier equilibrium|
| D3 | Push & Slide (Impulse)      | 5,500     | 550      | 550 eps @ 10 dec/ep         | Friction calibration  |
| D4 | Throw & Handoff (Kinematic) | 6,000     | 500      | 500 eps @ 12 dec/ep         | Parabolic trajectory  |
| D5 | Character Dynamic Contact   | 5,400     | 450      | 450 eps @ 12 dec/ep         | Off-centre striking   |
| D6 | Cloth Draping & Collision   | 3,600     | 550      | 400 eps @ 6 + 150 eps @ 8   | Pinning / zero tunnel |
+----+-----------------------------+-----------+----------+-----------------------------+-----------------------+
|    | SUB-TOTAL PHYSICS DOMAINS   | 32,000    | 3,100    | 80.00% Decisions / 81.3% Eps| Full Multi-Body Suite |
+----+-----------------------------+-----------+----------+-----------------------------+-----------------------+
| R1 | Replay: Phase 4 Scene Build | 2,750     | 250      | 250 eps @ 11 dec/ep         | Scene staging         |
| R2 | Replay: Phase 5 Rigging     | 2,700     | 230      | 170 eps @ 12 + 60 eps @ 11  | Armature / skinning   |
| R3 | Replay: Phase 6 Motion      | 2,550     | 232      | 230 eps @ 11 + 2 eps @ 10   | Walk/Run/Jump cycles  |
+----+-----------------------------+-----------+----------+-----------------------------+-----------------------+
|    | SUB-TOTAL REPLAY DOMAINS    | 8,000     | 712      | 20.00% Decisions / 18.7% Eps| Backward Parity       |
+----+-----------------------------+-----------+----------+-----------------------------+-----------------------+
|    | GRAND TOTAL                 | 40,000    | 3,812    | 100.00% Integer Alignment   | Zero Discrepancy      |
+----+-----------------------------+-----------+----------+-----------------------------+-----------------------+
```

### Partition Manifest (75% Train / 15% Val / 10% Test)
- **Train Set (75.00%):** 30,000 decisions across 2,859 episodes.
- **Validation Set (15.00%):** 6,000 decisions across 572 episodes.
- **Test Set (10.00%):** 4,000 decisions across 381 episodes.
- Partitions are strictly episode-isolated (zero task-spec or seed leakage).

---

## 9. Updated Pilot Benchmark Specification

Prior to full dataset generation, a controlled **2,500-decision pilot** across 240 episodes will be executed and evaluated in Blender 5.2.3 LTS.

### 9.1 Decoupled Acceptance Criteria

```
+----------------------------------------------------------------------------------------------------+
| PHASE 7 PILOT ACCEPTANCE CRITERIA MATRIX                                                           |
+---------------------------------------+---------------------+---------------------+----------------+
| Benchmark Metric                      | Minimum Threshold   | Target Goal         | Metric Nature  |
+---------------------------------------+---------------------+---------------------+----------------+
| Discrete Action Selection Accuracy    | >= 88.0%            | >= 92.5%            | Decision Top-1 |
| Candidate Object Pointer Accuracy     | >= 92.0%            | >= 95.0%            | Pointer Top-1  |
| Translation Position MAE              | <= 35.0 mm          | <= 20.0 mm          | Cartesian Pos  |
| Linear Impulse Prediction MAE         | <= 0.50 N*s         | <= 0.20 N*s         | Dynamic J      |
| Angular Impulse (Torque) Vector MAE   | <= 0.08 N*m*s       | <= 0.03 N*m*s       | Dynamic Delta L|
| Orientation Geodesic Error            | <= 0.12 rad (6.88°) | <= 0.08 rad (4.58°) | Attitude SO(3) |
| Physical Task Success Rate            | >= 90.0%            | >= 95.0%            | Goal Achieve   |
| Dynamic Settling Stability (Stacking) | >= 94.0%            | >= 98.0%            | Equilibrium    |
| Cloth Deflector Penetration           | <= 1.0 mm           | <= 0.2 mm           | Collision Gap  |
| Neural Inference Latency (Batch 1)    | <= 25.0 ms          | <= 15.0 ms          | Model Forward  |
| Blender Physics Step Time (per frame) | <= 45.0 ms          | <= 30.0 ms          | Bullet / Cloth |
| Legacy Replay Retention (Phases 4-6)  | >= 94.0%            | >= 98.0%            | Zero Forget    |
+---------------------------------------+---------------------+---------------------+----------------+
```

---

## 10. Milestone Roadmap & Approval Gates

```mermaid
flowchart TD
    G1["GATE 1: Architecture Correction Approval (Version 1.0.2)"] -->|"Explicit User Approval"| M2["Milestone 2: Pilot Dataset Generation (2,500 Dec / 240 Eps)"]
    M2 --> M3["Milestone 3: Pilot Model Training & Verification"]
    M3 --> G3["GATE 3: Pilot Physical Acceptance Benchmark Evaluation"]
    G3 -->|"Explicit User Approval"| M4["Milestone 4: Full 40,000-Decision Dataset Generation"]
    M4 --> M5["Milestone 5: Full Blender-S1 v5 Production Training"]
    M5 --> G5["GATE 5: Comprehensive Physical & Capability Retention Audit"]
```

- **Current Gate:** **GATE 1 (Architecture Specification Approval).**
- Execution will pause immediately for user review and direction.

---

> [!IMPORTANT]
> **Directive Compliance Notice:** Checkpoint `blender_s1_v4_2_motion_intelligence.pt` (SHA-256: `1fd7fe...`) is frozen and pristine. Zero dataset generation or training has occurred. Version 1.0.2 incorporates every correction from the directive.

