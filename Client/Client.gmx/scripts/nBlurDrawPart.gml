/// nBlurDrawPart(sprite, subimage, x, y, xscale, yscale, alpha)

var _length = median(0, point_distance(x, y,  xprevious, yprevious), 1024);
var _diretion = point_direction(x, y, xprevious, yprevious);
var rot = abs(_rotation);
var r = _rotation;

if(_length + rot && nEngine) {
    _length /= nBlurQuality;
    rot /= nBlurQuality * 2;
    r /= nBlurQuality * 2;
    
    var blur = max(rot, _length);
    var blurStretchX = 0
    var blurStretchY = 0;
    if(_length) {
        blurStretchX = lengthdir_x(_length / blur * nBlurQuality, _diretion);
        blurStretchY = lengthdir_y(_length / blur * nBlurQuality, _diretion);
    }
    
    var ri = r / blur * 2 * nBlurQuality;
    
    for(var ii = blur; ii > 0; ii--) {
        draw_sprite_ext(argument[0], argument[1], argument[2] + ii * blurStretchX, argument[3] + ii * blurStretchY, argument[4], argument[5], image_angle + ri * ii, image_blend, argument[6] / ((blur) / 2));
    }
}
else
    draw_sprite_ext(argument[0], argument[1], argument[2], argument[3], argument[4], argument[5], image_angle, image_blend, argument[6]);
