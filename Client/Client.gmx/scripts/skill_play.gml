/// skill_play(index);
// return 이 1이면 있는 스킬
// 누르고 끌어당기면 활성화되는 스킬들
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
                a.effector = 1;
                a.from = global.login_id;
                a.from_team = global.team;
                a.damage = 15;
                a.range = 40;
                
                system.shake = 1;
                weapon_delay = 40;
                weapon_delay_j = 0;
                weapon_range = 10;
                weapon_angle = -140;
                
                // 이펙트 만들기
                var buffer = buffer_create(1, buffer_grow, 1);
                buffer_write(buffer, buffer_u8, NN.signal_instance);
                buffer_write(buffer, buffer_u8, 0); // type
                buffer_write(buffer, buffer_u16, x);
                buffer_write(buffer, buffer_u16, y);
                buffer_write(buffer, buffer_s16, weapon_dir);
                nn_send_message(buffer);
                buffer_delete(buffer);
                
                // 스킬 1 큰 화염
                var buffer = buffer_create(1, buffer_grow, 1);
                buffer_write(buffer, buffer_u8, NN.signal_instance);
                buffer_write(buffer, buffer_u8, 3); // type
                buffer_write(buffer, buffer_u16, x);
                buffer_write(buffer, buffer_u16, y);
                buffer_write(buffer, buffer_u8, a.speed);
                buffer_write(buffer, buffer_s16, weapon_dir);
                buffer_write(buffer, buffer_s16, a.direction);
                buffer_write(buffer, buffer_s16, a.image_speed);
                buffer_write(buffer, buffer_s16, a.sprite_index);
                buffer_write(buffer, buffer_s8, a.move);
                buffer_write(buffer, buffer_s16, a.effector);
                buffer_write(buffer, buffer_s16, a.range);
                buffer_write_string(buffer, global.login_id);
                buffer_write_string(buffer, global.team);
                buffer_write(buffer, buffer_s16, a.damage);
                nn_send_message(buffer);
                buffer_delete(buffer);
                
                other.delay = system.skill_delay[other.skill_index];
                other.delay_max = other.delay;
                audio_play_sound(sd_swing, 1, 0);
                audio_play_sound(sd_magician_swing, 1, 0);
            return 1;
            
            case 1:
            
            return -1;
            
            case 2:
            
            return -1;
            
            case 6:
                var a = instance_create(x, y - 16 - z, obj_effect);
                a.image_angle = weapon_dir - 47;
                a.sprite_index = spr_effect;
                a.image_single = 1;
                
                var a = instance_create(x, y - z - 16, obj_effect_damage);
                a.image_angle = weapon_dir;
                a.direction = weapon_dir;
                a.damage = 40;
                a.from = global.login_id;
                a.from_team = global.team;
                
                system.shake = 1;
                weapon_delay = 3;
                weapon_delay_j = 3;
                attack_delay = 50;
                weapon_trigger *= -1
                weapon_range = 30;
                weapon_angle = 600;
                weapon_delay_i = -100;
                attack_delay = 30;
                
                // 이펙트 만들기
                var buffer = buffer_create(1, buffer_grow, 1);
                buffer_write(buffer, buffer_u8, NN.signal_instance);
                buffer_write(buffer, buffer_u8, 5); // type
                buffer_write(buffer, buffer_u16, x);
                buffer_write(buffer, buffer_u16, y);
                buffer_write(buffer, buffer_s16, weapon_dir);
                buffer_write_string(buffer, global.login_id);
                buffer_write_string(buffer, global.team);
                buffer_write(buffer, buffer_s16, a.damage);
                nn_send_message(buffer);
                buffer_delete(buffer);
                
                audio_play_sound(sd_swing, 1, 0);
            return 1;
            
            case 7:
            
            return -1;
            
            case 8:
            
            return -1;
            
            default:
            
            return 1;
        }
    }
}
