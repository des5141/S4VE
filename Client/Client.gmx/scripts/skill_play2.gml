/// skill_play(index);
with(par_player) {
    if(control == 1) {
        switch(argument0) {
            case 0:
                
            break;
            
            case 1:
                if(place_free(x + lengthdir_x(100, point_direction(other.x, other.y, other.pointer[0], other.pointer[1])), y + lengthdir_y(100, point_direction(other.x, other.y, other.pointer[0], other.pointer[1])))) {
                    instance_create(x, y - 16, obj_effect3);
                    var _x = x, _y = y;
                    x = x + lengthdir_x(100, point_direction(other.x, other.y, other.pointer[0], other.pointer[1]));
                    y = y + lengthdir_y(100, point_direction(other.x, other.y, other.pointer[0], other.pointer[1]));
                    var a = instance_create(x, y, obj_effect2);
                    a.draw_x[0] = x;
                    a.draw_y[0] = y - 16;
                    a.draw_x[1] = _x;
                    a.draw_y[1] = _y - 16;
                    
                    other.delay = system.skill_delay[other.skill_index];
                    other.delay_max = other.delay;
                }
            break;
            
            case 2:
                var a = instance_create(x, y - 16 - z, obj_effect);
                a.image_angle = weapon_dir - 47;
                a.sprite_index = spr_effect;
                a.image_single = 1;
                
                var a = instance_create(x + lengthdir_x(min(point_distance(other.x, other.y, other.pointer[0], other.pointer[1]), 120), point_direction(other.x, other.y, other.pointer[0], other.pointer[1])), y + lengthdir_y(min(point_distance(other.x, other.y, other.pointer[0], other.pointer[1]), 120), point_direction(other.x, other.y, other.pointer[0], other.pointer[1])), obj_effect4);
                a.from = global.login_id;
                a.damage = 20;
                a.from_team = global.team;
                
                system.shake = 1;
                weapon_delay = 40;
                weapon_delay_j = 0;
                weapon_range = 10;
                weapon_angle = -140;
                attack_delay = 50;
                
                var json_data = ds_map_create();
                ds_map_add(json_data, "id", NN.signal_instance);
                var json_data_weapon = ds_map_create();
                ds_map_add(json_data_weapon, "type", 0);
                ds_map_add(json_data_weapon, "speed", a.speed);
                ds_map_add(json_data_weapon, "weapon_dir", weapon_dir);
                ds_map_add(json_data_weapon, "direction", a.direction);
                ds_map_add(json_data_weapon, "image_speed", a.image_speed);
                ds_map_add(json_data_weapon, "sprite_index", a.sprite_index);
                ds_map_add(json_data_weapon, "x", x);
                ds_map_add(json_data_weapon, "y", y);
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
                ds_map_add(json_data_weapon, "type", 4);
                ds_map_add(json_data_weapon, "x", a.x);
                ds_map_add(json_data_weapon, "y", a.y);
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
            break;
            
            case 3:
            
            break;
            
            default:
            
            break;
        }
    }
}
