///ease_in_elastic(value)
if (argument0 = 0)
 return 0;
else if (argument0 = 1)
 return 1;

var p = 0.3;
var s = p / 4;
var t = argument0 - 1;

return -(power(2, 10 * t)) * sin((t - s) * (2 * pi) / p);
