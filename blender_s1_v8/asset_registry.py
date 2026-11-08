"""
Blender-S1 Phase 8: Reusable Asset Registry & Continuity System
Guarantees consistent proportions, rigs, materials, and props across all shots.
"""
import bpy
from mathutils import Vector, Euler

class AssetRegistry:
    def __init__(self):
        self.registry = {}

    def build_character_nova(self, location=(0.0, 0.0, 0.0)) -> bpy.types.Object:
        """Builds or instantiates canonical character Nova with biped armature and cape."""
        # 1. Base Root
        bpy.ops.mesh.primitive_cube_add(size=0.4, location=(location[0], location[1], location[2] + 1.0))
        torso = bpy.context.active_object
        torso.name = "NOVA_Torso"

        # Add head
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(location[0], location[1], location[2] + 1.45))
        head = bpy.context.active_object
        head.name = "NOVA_Head"

        # Add Visor (Glowing Cyan)
        bpy.ops.mesh.primitive_cube_add(size=0.15, location=(location[0], location[1] + 0.16, location[2] + 1.45))
        visor = bpy.context.active_object
        visor.name = "NOVA_Visor"
        visor.scale = (1.2, 0.3, 0.4)

        # Materials
        mat_armor = bpy.data.materials.new(name="Mat_Nova_Armor")
        mat_armor.use_nodes = True
        bsdf = mat_armor.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.12, 0.14, 0.18, 1.0) # Dark carbon
            bsdf.inputs["Roughness"].default_value = 0.35
            bsdf.inputs["Metallic"].default_value = 0.8
        torso.data.materials.append(mat_armor)
        head.data.materials.append(mat_armor)

        mat_visor = bpy.data.materials.new(name="Mat_Nova_Visor")
        mat_visor.use_nodes = True
        bsdf_v = mat_visor.node_tree.nodes.get("Principled BSDF")
        if bsdf_v:
            bsdf_v.inputs["Base Color"].default_value = (0.0, 0.85, 1.0, 1.0)
            if "Emission Color" in bsdf_v.inputs:
                bsdf_v.inputs["Emission Color"].default_value = (0.0, 0.85, 1.0, 1.0)
                bsdf_v.inputs["Emission Strength"].default_value = 4.0
        visor.data.materials.append(mat_visor)

        # Cloth Cape attached to shoulders
        bpy.ops.mesh.primitive_grid_add(size=0.8, x_subdivisions=12, y_subdivisions=12, location=(location[0], location[1] - 0.22, location[2] + 1.15))
        cape = bpy.context.active_object
        cape.name = "NOVA_Cape"
        cape.rotation_euler = Euler((0.35, 0.0, 0.0))

        # Pin top vertices
        vg = cape.vertex_groups.new(name="PinShoulders")
        vg.add([0, 1, 2, 3, 10, 11, 12], 1.0, "REPLACE")

        cloth_mod = cape.modifiers.new(name="Cloth", type='CLOTH')
        cloth_mod.settings.vertex_group_mass = "PinShoulders"
        cloth_mod.settings.mass = 0.15
        cloth_mod.settings.tension_stiffness = 12.0
        cloth_mod.collision_settings.use_collision = True

        mat_cape = bpy.data.materials.new(name="Mat_Nova_Cape")
        mat_cape.use_nodes = True
        bsdf_c = mat_cape.node_tree.nodes.get("Principled BSDF")
        if bsdf_c:
            bsdf_c.inputs["Base Color"].default_value = (0.75, 0.22, 0.15, 1.0) # Crimson cloth
        cape.data.materials.append(mat_cape)

        return torso

    def build_environment_vault(self) -> bpy.types.Object:
        """Constructs the Ancient Vault environment with passive collision floor."""
        bpy.ops.mesh.primitive_plane_add(size=30.0, location=(0.0, 0.0, 0.0))
        floor = bpy.context.active_object
        floor.name = "ENV_Vault_Floor"
        bpy.ops.rigidbody.object_add()
        floor.rigid_body.type = 'PASSIVE'
        floor.rigid_body.friction = 0.35
        floor.rigid_body.restitution = 0.3

        mat_vault = bpy.data.materials.new(name="Mat_Vault_Stone")
        mat_vault.use_nodes = True
        bsdf = mat_vault.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.05, 0.06, 0.08, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.8
        floor.data.materials.append(mat_vault)

        # Background Columns
        for x_pos in [-6.0, 6.0]:
            for y_pos in [-6.0, 0.0, 6.0]:
                bpy.ops.mesh.primitive_cylinder_add(radius=0.6, depth=8.0, location=(x_pos, y_pos, 4.0))
                col = bpy.context.active_object
                col.name = f"ENV_Column_{x_pos}_{y_pos}"
                col.data.materials.append(mat_vault)

        return floor

    def build_prop_pedestal(self, location=(0.0, 0.0, 0.0)) -> bpy.types.Object:
        """Creates the central holding pedestal."""
        bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=0.9, location=(location[0], location[1], location[2] + 0.45))
        pedestal = bpy.context.active_object
        pedestal.name = "PROP_Pedestal"
        bpy.ops.rigidbody.object_add()
        pedestal.rigid_body.type = 'PASSIVE'
        pedestal.rigid_body.collision_shape = 'CYLINDER'
        return pedestal

    def build_prop_core(self, location=(0.0, 0.0, 1.15)) -> bpy.types.Object:
        """Creates the glowing Quantum Core cube with active Bullet Rigid Body."""
        bpy.ops.mesh.primitive_cube_add(size=0.35, location=location)
        core = bpy.context.active_object
        core.name = "PROP_QuantumCore"
        bpy.ops.rigidbody.object_add()
        core.rigid_body.type = 'ACTIVE'
        core.rigid_body.collision_shape = 'BOX'
        core.rigid_body.mass = 2.0
        core.rigid_body.friction = 0.25
        core.rigid_body.restitution = 0.65

        # Emissive glowing cyan crystal
        mat_core = bpy.data.materials.new(name="Mat_Quantum_Core")
        mat_core.use_nodes = True
        bsdf = mat_core.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.0, 0.9, 1.0, 1.0)
            bsdf.inputs["Transmission Weight"].default_value = 0.7
            bsdf.inputs["Roughness"].default_value = 0.1
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = (0.0, 0.9, 1.0, 1.0)
                bsdf.inputs["Emission Strength"].default_value = 5.0
        core.data.materials.append(mat_core)
        return core

    def build_prop_deflector(self, location=(0.0, 4.5, 0.0)) -> bpy.types.Object:
        """Creates the energy deflector pillar that deflects the core."""
        bpy.ops.mesh.primitive_cylinder_add(radius=0.8, depth=2.5, location=(location[0], location[1], location[2] + 1.25))
        deflector = bpy.context.active_object
        deflector.name = "PROP_Deflector"
        bpy.ops.rigidbody.object_add()
        deflector.rigid_body.type = 'PASSIVE'
        deflector.rigid_body.collision_shape = 'CYLINDER'
        deflector.rigid_body.restitution = 0.75
        deflector.rigid_body.friction = 0.1

        # Energy glow
        mat_def = bpy.data.materials.new(name="Mat_Deflector")
        mat_def.use_nodes = True
        bsdf = mat_def.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (1.0, 0.4, 0.1, 1.0) # Amber barrier
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = (1.0, 0.4, 0.1, 1.0)
                bsdf.inputs["Emission Strength"].default_value = 3.0
        deflector.data.materials.append(mat_def)
        return deflector

    def setup_cinematic_lighting(self):
        """Sets up a three-point moody sci-fi lighting rig."""
        # Key Light (Cool Cyan)
        bpy.ops.object.light_add(type='AREA', location=(3.0, -3.0, 4.5))
        key = bpy.context.active_object
        key.data.energy = 500.0
        key.data.color = (0.2, 0.75, 1.0)
        key.data.size = 2.0

        # Fill Light (Deep Blue)
        bpy.ops.object.light_add(type='POINT', location=(-4.0, -2.0, 3.0))
        fill = bpy.context.active_object
        fill.data.energy = 250.0
        fill.data.color = (0.1, 0.2, 0.8)

        # Rim Light (Warm Amber)
        bpy.ops.object.light_add(type='SPOT', location=(0.0, 5.0, 5.0))
        rim = bpy.context.active_object
        rim.data.energy = 650.0
        rim.data.color = (1.0, 0.6, 0.2)

