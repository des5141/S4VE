///nn_send_message(msg)
{
    global.check_bytes_send += buffer_tell(argument0);
    network_send_raw(sys_nn.client, argument0, buffer_tell(argument0));
}
