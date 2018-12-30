/// script_similar(type, a,[b1,b2,b3....])

var vreturn = 0, ireturn = -1;
var vminimum = abs(argument[1])+1;
var vorg = argument[1];

for (var i=0; i<argument[2]; i++){
if (abs(vorg-(400-340*i)) < vminimum){
vminimum = abs(vorg-(400-340*i));
vreturn = (400-340*i);
ireturn = i;
}
}
if(argument[0] == 0)
    return vreturn;
else
    return ireturn;
