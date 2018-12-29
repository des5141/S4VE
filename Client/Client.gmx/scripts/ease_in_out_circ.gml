///ease_in_out_circ(value)
if (argument0 <= 0)
 return 0;
else if (argument0 >= 1)
 return 1;

var t = argument0 * 2;

if (t < 1)
 return -0.5 * (sqrt(1 - t * t) - 1);

t -= 2;

return 0.5 * (sqrt(1 - t * t) + 1);
