# 📦 ROS 消息系统 (Message) 详解

> 🎯 **核心概念**：ROS中用于定义数据格式的消息系统，支持自定义消息类型来实现节点间的结构化数据传输

---

## 🔄 消息系统特点


| 特性             | 说明                      | 应用场景           |
| ---------------- | ------------------------- | ------------------ |
| **类型安全**     | 编译时检查数据类型        | 防止数据格式错误   |
| **跨语言支持**   | 支持Python、C++等多种语言 | 不同语言节点间通信 |
| **自动生成代码** | 自动生成对应语言的头文件  | 简化开发流程       |
| **可扩展性**     | 支持自定义消息字段        | 适应复杂应用需求   |

---

## 📋 基本术语

- **Message** (消息) - 定义数据结构的文件
- **Publisher** (发布者) - 发送消息的节点
- **Subscriber** (订阅者) - 接收消息的节点
- **msg文件** - 定义消息格式的文本文件

---

## 🚀 自定义消息创建流程

### 📝 完整步骤

1. **📁 创建msg文件夹**

   ```bash
   在ROS包目录下创建msg文件夹
   ```
2. **📄 定义.msg文件**

   ```bash
   在msg文件夹中创建自定义消息定义文件
   ```
3. **⚙️ 修改CMakeLists.txt**

   ```bash
   添加message_generation依赖和消息生成配置
   ```
4. **📦 修改package.xml**

   ```bash
   添加消息生成和运行时依赖
   ```
5. **🔨 编译ROS包**

   ```bash
   使用catkin_make编译生成头文件
   ```
6. **💻 使用自定义消息**

   ```bash
   在代码中包含生成的头文件并使用
   ```

---

## 🛠️ 配置详解

### 1. 创建自定义消息文件

#### GPS消息示例 (gps.msg)

```text
# GPS消息定义文件
string state    # GPS状态信息
float32 x       # X坐标位置
float32 y       # Y坐标位置
```

### 2. 修改CMakeLists.txt配置

```cmake
# 查找必要的包
find_package(catkin REQUIRED COMPONENTS
  roscpp
  rospy
  std_msgs
  message_generation  # 添加消息生成依赖
)

# 声明消息文件
add_message_files(
  FILES
  gps.msg  # 自定义消息文件名
)

# 生成消息
generate_messages(
  DEPENDENCIES
  std_msgs  # 依赖的标准消息包
)

# 设置运行时依赖
catkin_package(
  CATKIN_DEPENDS message_runtime  # 消息运行时依赖
)
```

### 3. 修改package.xml配置

```xml
<!-- 消息生成依赖 -->
<build_depend>message_generation</build_depend>
<exec_depend>message_runtime</exec_depend>

<!-- 消息依赖包 -->
<build_depend>std_msgs</build_depend>
<exec_depend>std_msgs</exec_depend>
```

### 4. 编译生成头文件

```bash
# 编译整个工作空间
catkin_make

# 或者只编译特定包
catkin_make --only-pkg-with-deps your_package_name

# 编译后，生成的头文件位于：
# devel/include/your_package_name/gps.h
```

---

## 💻 C++实现示例

### 📄 GPS发布者 (C++)

#### 🔄 流程与思路

1. **包含头文件**：包含ROS核心头文件和自定义消息头文件
2. **主函数入口**：从main函数开始，获取命令行参数
3. **初始化ROS系统**：使用ros::init()初始化节点
4. **创建节点句柄**：创建ros::NodeHandle对象用于ROS通信
5. **创建发布者**：使用advertise()创建Publisher对象，指定消息类型和话题名
6. **初始化消息和变量**：创建消息对象并初始化计数器
7. **创建频率控制对象**：创建ros::Rate对象设置循环频率
8. **主循环发布**：循环中设置消息内容、发布消息、处理回调、控制频率

#### 🔍 重点难点解析

##### 1️⃣ **Publisher结构体解析**

`ros::Publisher` 是一个C++类(不是结构体),它封装了ROS发布者的所有功能。主要成员包括:

```cpp
class Publisher {
public:
    // 核心方法
    void publish(const Message& message);           // 发布消息
    uint32_t getNumSubscribers() const;            // 获取订阅者数量
    std::string getTopic() const;                  // 获取话题名称
    void shutdown();                                // 关闭发布者

    // 操作符重载
    operator void*() const;                        // 检查Publisher是否有效

private:
    // 内部实现指针(PIMPL设计模式)
    boost::shared_ptr<Impl> impl_;                 // 指向实现细节的智能指针
};
```

**关键特性:**

- 使用**智能指针**管理资源,自动处理内存释放
- 采用**PIMPL**模式隐藏实现细节,提高编译效率
- 支持**拷贝语义**,可以安全地复制Publisher对象

##### 2️⃣ **advertise模板函数详解**

`advertise<T>()` 是 `ros::NodeHandle` 类的模板成员函数,用于创建发布者对象。

**完整函数原型:**

```cpp
template <class M>
Publisher NodeHandle::advertise(
    const std::string& topic,      // 话题名称
    uint32_t queue_size,           // 队列大小
    bool latch = false             // 是否锁存(可选,默认false)
)
{
    // 创建发布选项对象
    AdvertiseOptions ops;

    // 使用模板参数M初始化选项
    ops.template init<M>(topic, queue_size);

    // 设置锁存模式
    ops.latch = latch;

    // 调用重载版本的advertise函数
    return advertise(ops);
}
```

**函数执行流程:**

```text
步骤1: 创建AdvertiseOptions对象
   ↓
步骤2: 使用消息类型M初始化选项
   ├─ 存储消息类型信息
   ├─ 设置序列化/反序列化函数
   └─ 保存话题名和队列大小
   ↓
步骤3: 设置锁存标志
   ↓
步骤4: 调用advertise(ops)创建Publisher
   ↓
返回: Publisher对象
```

**参数详解:**


| 参数         | 类型                 | 作用                 | 示例值                   |
| ------------ | -------------------- | -------------------- | ------------------------ |
| `<M>`        | 模板参数             | 指定消息类型         | `your_package_name::gps` |
| `topic`      | `const std::string&` | 话题名称             | `"gps_info"`             |
| `queue_size` | `uint32_t`           | 消息队列大小         | `10`                     |
| `latch`      | `bool`               | 是否保留最后一条消息 | `false`                  |

**实际使用示例:**

```cpp
// 示例1: 基本用法(不使用锁存)
ros::Publisher pub1 = nh.advertise<your_package_name::gps>("gps_info", 10);
//                        ↑              ↑                      ↑         ↑
//                    模板参数        消息类型                话题名    队列大小

// 示例2: 使用锁存模式(适合配置参数)
ros::Publisher pub2 = nh.advertise<std_msgs::String>("robot_name", 1, true);
//                                                                      ↑
//                                                                   锁存开启

// 示例3: 发布图像消息
ros::Publisher pub3 = nh.advertise<sensor_msgs::Image>("camera/image", 5);
```

**关键技术点:**

1. **`ops.template init<M>()`语法解释**

   ```cpp
   ops.template init<M>(topic, queue_size);
   //      ↑        ↑
   //   template关键字  模板参数M
   ```

   - 在模板函数内部调用另一个模板函数时,需要显式使用`template`关键字
   - 这是C++的语法要求,用于消除歧义
   - `init<M>`将消息类型M的信息存储到AdvertiseOptions中
2. **AdvertiseOptions对象的作用**

   ```cpp
   struct AdvertiseOptions {
       std::string topic;              // 话题名称
       uint32_t queue_size;            // 队列大小
       std::string datatype;           // 消息数据类型字符串
       std::string md5sum;             // 消息MD5校验和
       bool latch;                     // 锁存标志
       // ... 其他配置选项
   };
   ```
3. **编译时类型检查机制**

   ```cpp
   // ✅ 类型匹配 - 编译通过
   ros::Publisher pub = nh.advertise<your_package_name::gps>("topic", 10);
   your_package_name::gps msg;
   pub.publish(msg);  // OK

   // ❌ 类型不匹配 - 编译错误
   ros::Publisher pub = nh.advertise<your_package_name::gps>("topic", 10);
   std_msgs::String msg;
   pub.publish(msg);  // 编译错误: 类型不匹配!
   ```

```cpp
#include "ros/ros.h"                     // ROS核心头文件
#include "your_package_name/gps.h"       // 自定义GPS消息头文件

// 程序主函数
int main(int argc, char **argv)
{
    // 步骤1：初始化ROS系统
    ros::init(argc, argv, "gps_talker_node");

    // 步骤2：创建节点句柄
    ros::NodeHandle nh;

    // 步骤3：创建发布者对象
    // 使用自定义消息类型：your_package_name::gps
    ros::Publisher pub = nh.advertise<your_package_name::gps>("gps_info", 10);

    // 步骤4：初始化变量和消息对象
    your_package_name::gps msg;  // 创建自定义消息对象
    int count = 0;

    // 步骤5：创建Rate对象用于控制循环频率
    // - ros::Rate 是频率控制类
    // - loop_rate 是对象名
    // - 参数1表示目标频率为1Hz（每秒1次）
    // - 后续通过loop_rate.sleep()方法维持此频率
    ros::Rate loop_rate(1);

    // 步骤6：主发布循环
    while (ros::ok())
    {
        // 设置消息内容
        msg.state = "working";
        msg.x = 1.5 + count * 0.1;
        msg.y = 2.3 + count * 0.1;

        // 发布消息
        pub.publish(msg);

        // 输出日志信息
        ROS_INFO("发布GPS信息: 状态=%s, x=%.2f, y=%.2f",
                 msg.state.c_str(), msg.x, msg.y);

        // 控制发布频率
        loop_rate.sleep();
        count++;

        // 处理回调函数（如果有订阅者的话）
        ros::spinOnce();
    }

    return 0;
}
```

### 📄 GPS订阅者 (C++)

#### 🔄 流程与思路

1. **包含头文件**：包含ROS核心头文件和自定义消息头文件
2. **定义回调函数**：创建处理GPS消息的回调函数
3. **主函数入口**：从main函数开始初始化
4. **初始化ROS系统**：使用rconsos::init()初始化节点
5. **创建节点句柄**：创建ros::NodeHandle对象
6. **创建订阅者**：订阅指定话题并绑定回调函数
7. **进入消息循环**：使用ros::spin()持续监听消息

```cpp
#include "ros/ros.h"                     // ROS核心头文件
#include "your_package_name/gps.h"       // 自定义GPS消息头文件

// GPS消息回调函数
void gps_callback(const your_package_name::gps::ConstPtr& msg)
{
    // 根据状态信息进行不同的处理
    if (msg->state == "working")
    {
        ROS_INFO("GPS状态：工作中，位置：(%.2f, %.2f)", msg->x, msg->y);
    }
    else if (msg->state == "ok")
    {
        ROS_INFO("GPS状态：正常，位置：(%.2f, %.2f)", msg->x, msg->y);
    }
    else
    {
        ROS_INFO("GPS状态：%s，位置：(%.2f, %.2f)", msg->state.c_str(), msg->x, msg->y);
    }
}

// 程序主函数
int main(int argc, char **argv)
{
    // 步骤1：初始化ROS系统
    ros::init(argc, argv, "gps_listener_node");

    // 步骤2：创建节点句柄
    ros::NodeHandle nh;

    // 步骤3：创建订阅者
    // 参数：话题名、队列大小、回调函数
    ros::Subscriber sub = nh.subscribe("gps_info", 1, gps_callback);

    // 步骤4：输出启动信息
    ROS_INFO("GPS订阅者节点已启动...");

    // 步骤5：进入消息循环
    ros::spin();  // 持续监听消息，直到程序被中断

    return 0;
}
```

---

## 🐍 Python实现 (简化版)

### 📄 GPS发布者 (Python)

**核心代码:**

```python
import rospy
from your_package_name.msg import gps

def gps_talker():
    rospy.init_node("gps_talker_node")
    pub = rospy.Publisher("gps_info", gps, queue_size=10)
    rate = rospy.Rate(1)
    count = 0
    msg = gps()

    while not rospy.is_shutdown():
        msg.state = "working"
        msg.x = 1.5 + count * 0.1
        msg.y = 2.3 + count * 0.1
        pub.publish(msg)
        rospy.loginfo("发布: %s, (%.2f, %.2f)", msg.state, msg.x, msg.y)
        rate.sleep()
        count += 1

if __name__ == "__main__":
    gps_talker()
```

**关键步骤:**

1. 导入自定义消息 `from your_package_name.msg import gps`
2. 创建Publisher `rospy.Publisher("topic", gps, queue_size)`
3. 设置消息字段 `msg.state`, `msg.x`, `msg.y`
4. 发布消息 `pub.publish(msg)`

### 📄 GPS订阅者 (Python)

**核心代码:**

```python
import rospy
from your_package_name.msg import gps

def gps_callback(msg):
    rospy.loginfo("收到: %s, (%.2f, %.2f)", msg.state, msg.x, msg.y)

def gps_listener():
    rospy.init_node("gps_listener_node")
    rospy.Subscriber("gps_info", gps, gps_callback, queue_size=1)
    rospy.spin()

if __name__ == "__main__":
    gps_listener()
```

**关键步骤:**

1. 定义回调函数 `def gps_callback(msg): ...`
2. 创建Subscriber `rospy.Subscriber("topic", gps, callback)`
3. 保持运行 `rospy.spin()`

---

## ⚙️ 编译和运行方法

### 1. 编译ROS包

```bash
# 进入工作空间根目录
cd ~/catkin_ws

# 编译整个工作空间
catkin_make

# 或只编译特定包
catkin_make --only-pkg-with-deps your_package_name

# 刷新环境变量
source devel/setup.bash
```

### 2. 运行节点

#### 启动ROS Master

```bash
roscore
```

#### 运行GPS发布者

```bash
# Python版本
rosrun your_package_name gps_talker.py

# C++版本
rosrun your_package_name gps_talker
```

#### 运行GPS订阅者

```bash
# Python版本
rosrun your_package_name gps_listener.py

# C++版本
rosrun your_package_name gps_listener
```

### 3. 验证消息类型

#### 查看话题信息

```bash
# 列出所有话题
rostopic list

# 查看话题消息类型
rostopic type /gps_info

# 查看话题详细信息
rostopic info /gps_info

# 实时显示消息内容
rostopic echo /gps_info
```

#### 查看消息定义

```bash
# 查看自定义消息定义
rosmsg show your_package_name/gps

# 输出结果：
# string state
# float32 x
# float32 y
```

---

## 💡 消息系统使用要点

### ✅ 基本注意事项

- **消息命名规范**：使用小写字母和下划线，避免特殊字符
- **字段类型选择**：选择合适的消息类型，float32用于一般精度，float64用于高精度
- **编译顺序**：修改消息文件后必须重新编译，否则会出现链接错误
- **头文件包含**：确保包含了正确的自定义消息头文件

### ✅ 常见问题解决

- **找不到头文件**：检查package.xml和CMakeLists.txt配置是否正确，重新编译
- **消息类型不匹配**：确保发布者和订阅者使用相同的消息类型
- **编译错误**：检查msg文件语法，确保没有拼写错误
- **运行时错误**：确保source了devel/setup.bash环境变量

### ✅ 消息设计最佳实践

- **保持简洁**：消息字段应该简洁明了，避免不必要的复杂性
- **向后兼容**：添加新字段时，确保不会破坏现有的代码
- **文档注释**：在msg文件中添加注释说明每个字段的用途
- **类型安全**：选择合适的数据类型，避免类型转换错误

---

<div align="center">

**📖 米醋电子工作室 | KimJong 版权所有**

</div>
