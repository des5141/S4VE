///joy_get_direction(type)
switch(argument0)
{
    case 1:
        return point_direction(obj_joy.x, obj_joy.y, obj_joy.tx, obj_joy.ty)
        
    case 2:
        return point_direction(obj_joy2.x, obj_joy2.y, obj_joy2.tx, obj_joy2.ty)
}
