/// skill_play(index);
with(par_player) {
    if(control == 1) {
        switch(argument0) {
            case 0:
                var a = instance_create(x, y - 16 - z, obj_effect);
                a.image_angle = weapon_dir - 47;
                a.sprite_index = spr_effect;
                a.image_single = 1;
                var a = instance_create(x + lengthdir_x(20, weapon_dir), y + lengthdir_y(20, weapon_dir) - 12 - z, obj_bullet);
                a.speed = 5;
                a.direction = weapon_dir;
                a.image_angle = weapon_dir;
                a.image_speed = 0.7;
                a.sprite_index = spr_fireball;
                a.mask_index = spr_fireball;
                a.turn = 1;
                a.move = irandom_range(2, 7);
                a.sprite = spr_fire;
                a.from = global.login_id;
                a.from_team = global.team;
                a.damage = 15;
                a.range = 40;
                
                system.shake = 1;
                weapon_delay = 40;
                weapon_delay_j = 0;
                weapon_range = 10;
                weapon_angle = -140;
                
                var json_data = ds_map_create();
                ds_map_add(json_data, "id", NN.signal_instance);
                var json_data_weapon = ds_map_create();
                ds_map_add(json_data_weapon, "type", 0);
                ds_map_add(json_data_weapon, "speed", a.speed);
                ds_map_add(json_data_weapon, "weapon_dir", weapon_dir);
                ds_map_add(json_data_weapon, "direction", a.direction);
                ds_map_add(json_data_weapon, "image_speed", a.image_speed);
                ds_map_add(json_data_weapon, "sprite_index", a.sprite_index);
                ds_map_add(json_data_weapon, "move", a.move);
                ds_map_add(json_data_weapon, "sprite", a.sprite);
                ds_map_add(json_data_weapon, "x", x);
                ds_map_add(json_data_weapon, "y", y);
                ds_map_add(json_data_weapon, "range", a.range);
                ds_map_add(json_data_weapon, "from", global.login_id);
                ds_map_add(json_data_weapon, "damage", a.damage);
                ds_map_add(json_data_weapon, "team", global.team);
                ds_map_add(json_data, "msg", json_encode(json_data_weapon));
                ds_map_destroy(json_data_weapon);
                var body = json_encode(json_data);
                ds_map_destroy(json_data);
                nn_send_message(body);
                
                var json_data = ds_map_create();
                ds_map_add(json_data, "id", NN.signal_instance);
                var json_data_weapon = ds_map_create();
                ds_map_add(json_data_weapon, "type", 3);
                ds_map_add(json_data_weapon, "speed", a.speed);
                ds_map_add(json_data_weapon, "weapon_dir", weapon_dir);
                ds_map_add(json_data_weapon, "direction", a.direction);
                ds_map_add(json_data_weapon, "image_speed", a.image_speed);
                ds_map_add(json_data_weapon, "sprite_index", a.sprite_index);
                ds_map_add(json_data_weapon, "move", a.move);
                ds_map_add(json_data_weapon, "sprite", a.sprite);
                ds_map_add(json_data_weapon, "x", x );
                ds_map_add(json_data_weapon, "y", y );
                ds_map_add(json_data_weapon, "range", a.range);
                ds_map_add(json_data_weapon, "from", global.login_id);
                ds_map_add(json_data_weapon, "damage", a.damage);
                ds_map_add(json_data_weapon, "team", global.team);
                ds_map_add(json_data, "msg", json_encode(json_data_weapon));
                ds_map_destroy(json_data_weapon);
                var body = json_encode(json_data);
                ds_map_destroy(json_data);
                nn_send_message(body);
                
                other.delay = system.skill_delay[other.skill_index];
                other.delay_max = other.delay;
            return 1;
            
            case 1:
            
            return -1;
            
            case 2:
            
            return -1;
            
            case 3:
            
            return 1;
            
            default:
            
            return 1;
        }
    }
}
