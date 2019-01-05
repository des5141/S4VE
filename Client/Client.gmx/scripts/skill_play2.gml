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
                
                // 이펙트 만들기
                var buffer = buffer_create(1, buffer_grow, 1);
                buffer_write(buffer, buffer_u8, NN.signal_instance);
                buffer_write(buffer, buffer_u8, 0); // type
                buffer_write(buffer, buffer_u16, x);
                buffer_write(buffer, buffer_u16, y);
                buffer_write(buffer, buffer_s16, weapon_dir);
                nn_send_message(buffer);
                buffer_delete(buffer);
                
                // 메테오
                var buffer = buffer_create(1, buffer_grow, 1);
                buffer_write(buffer, buffer_u8, NN.signal_instance);
                buffer_write(buffer, buffer_u8, 4); // type
                buffer_write(buffer, buffer_u16, a.x);
                buffer_write(buffer, buffer_u16, a.y);
                buffer_write_string(buffer, global.login_id);
                buffer_write_string(buffer, global.team);
                buffer_write(buffer, buffer_s16, a.damage);
                nn_send_message(buffer);
                buffer_delete(buffer);
                
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
