/// nBlurDraw()

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
        draw_sprite_ext(self_sprite, image_index, x + ii * blurStretchX, y + ii * blurStretchY, image_xscale, image_yscale, image_angle + ri * ii, image_blend, image_alpha / (blur / 2));
    }
}
else
    draw_sprite_ext(self_sprite, image_index, x, y, image_xscale, image_yscale, image_angle, image_blend, image_alpha);
