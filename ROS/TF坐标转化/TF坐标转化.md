TF树，每人组件都有，称之为一个link，每个link有一个坐标系

map 根坐标系 odom 里程计坐标系 base_footprint 地盘坐标系】



map 地图坐标系 设为固定坐标系，在rviz中设置，全局唯一，长期稳定

odom 里程计坐标系 基于传感器反馈数据可以计算获得坐标系
会因为传感器原因导致漂移，但是可以通过AMCL位置估计矫正
所以短时间内稳定精确

baselink/basefootprint是baselink在地面上的投影 固定在机器人身上的坐标系，他自己的视角



map到Odom的变换
Odom可以倒推出map坐标系，也就是说为什么无误差两个坐标系是重合的