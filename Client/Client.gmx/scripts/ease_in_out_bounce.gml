///ease_in_out_bounce(value)
if (argument0 < 0.5)
 return 0.5 - ease_out_bounce(1 - argument0 * 2) * 0.5;
else
 return 0.5 + ease_out_bounce(argument0 * 2 - 1) * 0.5;
