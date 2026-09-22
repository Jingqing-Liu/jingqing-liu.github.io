-- 一起学 v2: administrator-provisioned accounts, per-book groups, CAS on all records.
-- Run as postgres in Supabase SQL Editor. Safe for a new database or an existing v1 installation.
begin;
create schema if not exists study_private;
revoke all on schema study_private from public, anon;
grant usage on schema study_private to authenticated;

create table if not exists public.study_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create table if not exists public.study_members (
  room_id uuid not null references public.study_rooms(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete restrict,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 40),
  seat integer not null,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id), unique (room_id, seat)
);
-- v1 had a two-seat check; seat is now only a stable display/color order.
alter table public.study_members drop constraint if exists study_members_seat_check;
alter table public.study_members alter column seat type integer;
create table if not exists public.study_records (
  id text not null check (char_length(id) between 1 and 300),
  room_id uuid not null references public.study_rooms(id) on delete cascade,
  kind text not null check (kind in ('project','progress','answer','session','review')),
  owner_id uuid not null references auth.users(id) on delete restrict,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  revision bigint not null default 1 check (revision > 0),
  project_id text,
  primary key (room_id, kind, id),
  check (kind = 'project' or left(id, 37) = owner_id::text || ':')
);
alter table public.study_records add column if not exists revision bigint not null default 1;
alter table public.study_records add column if not exists project_id text;
drop trigger if exists study_record_validate on public.study_records;
create index if not exists study_records_owner_idx on public.study_records(owner_id);
create index if not exists study_records_project_idx on public.study_records(room_id, project_id);

create table if not exists study_private.settings (
  singleton boolean primary key default true check (singleton),
  workspace_id uuid not null references public.study_rooms(id) on delete restrict
);
revoke all on study_private.settings from public, anon, authenticated;
-- Existing installations with exactly one workspace keep that workspace as the default.
insert into study_private.settings(singleton, workspace_id)
select true, id from public.study_rooms where (select count(*) from public.study_rooms) = 1
on conflict (singleton) do nothing;

-- Earlier clients could save networking progress before uploading its built-in project.
-- Restore only this known, complete template when real existing rows reference it.
-- Unknown orphan project IDs are preserved untouched for administrator recovery.
insert into public.study_records(room_id,kind,id,owner_id,payload,project_id)
select r.room_id,'project','computer-networking',(array_agg(r.owner_id order by r.updated_at,r.id))[1],
  $networking${"id":"computer-networking","title":"计算机网络：自顶向下方法","subtitle":"第 8 版 · 从原理到实践","kind":"book","description":"按学习包推进，保留阅读、自测、订正与伙伴互检。44 个阅读包、16 个章末作业入口，含 132 道自拟题；原书题以手中教材为准，可继续追加作业与实验。","color":"#007aff","chapters":[{"id":"1","title":"计算机网络和因特网","packs":[{"id":"1-01","title":"因特网、端系统与接入网","kind":"reading","reading":"1.1—1.2；p.1起；读至p.15的1.3前","minutes":"75—90","output":"画一张自有家庭网络图；标出端系统、链路、接入方式，并写一个协议例子。","bookPractice":"第1章复习题p.44起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"1-01-q1","prompt":"用具体例子分别说明端系统、通信链路、分组交换设备。","hint":"检查例子是否把终端和中间转发设备混为一谈。"},{"id":"1-01-q2","prompt":"“协议”只是约定报文格式吗？还需要约定什么？","hint":"回查1.1：还要考虑交互顺序、接收后的动作等。"},{"id":"1-01-q3","prompt":"画自己家中的联网路径，区分接入方式与物理传输介质。","hint":"回查1.2：把设备、连接方式和介质分别标注，不凭空认定家庭布线。"}],"base":true},{"id":"1-02","title":"分组交换、电路交换与网络核心","kind":"reading","reading":"1.3；p.15起；读至p.24的1.4前","minutes":"65—80","output":"画两种交换方式对照图；说明一个数据分组怎样经过多段链路。","bookPractice":"第1章复习题p.44起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"1-02-q1","prompt":"分组交换和电路交换怎样分配资源？各有什么取舍？","hint":"用是否预留资源、突发流量和等待情况比较。"},{"id":"1-02-q2","prompt":"存储转发与排队等待是不是同一件事？","hint":"先完整接收再转发，与等待前面的分组，是两个不同概念。"},{"id":"1-02-q3","prompt":"一个12000 bit分组依次通过3条10 Mbit/s链路；各跳存储转发，忽略传播、处理和排队，总时间多少？","hint":"每条链路1.2 ms，三条共3.6 ms；不能把3条链路速率直接相加。"}],"base":true},{"id":"1-03","title":"时延、丢包与吞吐量","kind":"reading","reading":"1.4；p.24起；读至p.32的1.5前","minutes":"75—90","output":"完成时延计算；画瓶颈链路图；把“下载慢”和“响应慢”分开描述。","bookPractice":"第1章复习题p.44起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"1-03-q1","prompt":"四类节点时延分别受什么因素影响？","hint":"区分处理、排队、传输、传播，不用“网络慢”代替具体解释。"},{"id":"1-03-q2","prompt":"路径链路速率为50、20、100 Mbit/s，忽略其他限制，瓶颈吞吐量是多少？","hint":"上界为20 Mbit/s；实际有效吞吐量还受其他因素影响。"},{"id":"1-03-q3","prompt":"1500字节经100 Mbit/s链路发送；距离1000 km、传播速率2×10^8 m/s，分别计算发送和传播时延。","hint":"发送0.12 ms；传播5 ms。注意byte转bit、km转m。"}],"base":true},{"id":"1-04","title":"分层、封装与初步安全意识","kind":"reading","reading":"1.5—1.6；p.32起；读至p.39的1.7前","minutes":"70—85","output":"画五层封装图；用一个安全风险说明受影响环节，不做攻击实验。","bookPractice":"第1章复习题p.44起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"1-04-q1","prompt":"画五层模型，说明各层主要解决的问题。","hint":"按本书五层结构，不要求强行背成OSI七层。"},{"id":"1-04-q2","prompt":"封装与“把数据加密”是不是同一个概念？","hint":"封装是添加相应协议控制信息，不等于加密。"},{"id":"1-04-q3","prompt":"一次网页访问失败，你会提出哪三种不同层面的检查方向？暂时只提假设。","hint":"检查是否把物理接入、网络路径与应用问题区分；不凭现象直接下结论。"}],"base":true},{"id":"1-05","title":"历史概览与第一章整合","kind":"reading","reading":"1.7—1.8；p.39起；读至p.44的课后题前","minutes":"50—65","output":"历史浏览、不背年份；修改首份网络图，并闭卷复述第一章的主线。","bookPractice":"第1章复习题p.44起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"1-05-q1","prompt":"只用一张图串起端系统、接入网、网络核心和分层。","hint":"图中角色与层次应自洽；可以把未知的具体协议留待后续。"},{"id":"1-05-q2","prompt":"用自己的话区分带宽、吞吐量、传播时延和排队时延。","hint":"至少举一个速率高但延迟仍大的例子。"},{"id":"1-05-q3","prompt":"朋友说“链路速率翻倍，所有访问耗时都减半”，你如何用本章概念反驳或补充前提？","hint":"传输时延可能下降，但传播、处理、排队及其他瓶颈未必按同样比例变化。"}],"base":true},{"id":"1-R","title":"章末复习题清点与补做","kind":"review","reading":"本章全部小节；p.44起；止于p.46的“习题”前","minutes":"60—80","output":"登记全部复习题；扣除已随单元完成的题；补做一批未做题并订正。未完成则追加R-02、R-03，不标整章完成。","bookPractice":"复习题以原书为准；每批约6—10道短概念题，复杂题减少数量，以60—80分钟为限。\n\n本章原书复习题全部纳入；已做题按题号勾选，不重复抄写。","questions":[],"base":true},{"id":"1-P","title":"章末习题首批与续包入口","kind":"practice","reading":"本章分析、计算与综合问题；p.46起；止于p.50的后续作业/实验前","minutes":"70—90","output":"按原书题号建立习题清单，独立完成第一批并订正；未做完继续P-02、P-03。全章习题处理完成后才做章末闭卷互检。","bookPractice":"一批通常3—5道普通题；大题1—2道；多小问按时间拆，不能把读过答案算独立完成。\n\n原书习题默认全部纳入分批清单，不因首批结束而省略剩余题。难题可先标待补；整章闭环前须回补。编程与实验另设X包。\n\n额外实验/编程入口：p.50：Wireshark 实验（独立选做包，不并入普通阅读包）。每项另开X包；默认60—120分钟，不够就继续拆，不占用一个普通阅读包的全部任务量。","questions":[],"base":true}]},{"id":"2","title":"应用层","packs":[{"id":"2-01","title":"应用架构、进程与运输服务","kind":"reading","reading":"2.1；p.53起；读至p.63的2.2前","minutes":"70—85","output":"画客户端—服务器和P2P对照图；为一种应用写出运输服务需求。","bookPractice":"第2章复习题p.110起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"2-01-q1","prompt":"客户—服务器与P2P架构分别有哪些角色？","hint":"注意“角色”不等于固定物理设备数量。"},{"id":"2-01-q2","prompt":"IP地址、端口和进程分别标识或关联什么？","hint":"检查是否把访问主机和访问主机上的应用混为一谈。"},{"id":"2-01-q3","prompt":"分别为文件下载和语音通话列出可靠性、时延、吞吐量等需求，并解释取舍。","hint":"按应用需求比较；不要仅凭“快”或“慢”选协议。"}],"base":true},{"id":"2-02","title":"HTTP基础、连接与报文","kind":"reading","reading":"2.2.1—2.2.3；p.63起；读至p.69的2.2.4前","minutes":"65—80","output":"用自编示例标注一次请求/响应；解释连接复用，先不搭复杂服务。","bookPractice":"第2章复习题p.110起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"2-02-q1","prompt":"HTTP请求和响应至少需要解释哪些字段或组成部分？","hint":"用书中的示例结构自编内容，不需要复制真实登录报文。"},{"id":"2-02-q2","prompt":"持久连接解决什么问题？它与缓存是同一个机制吗？","hint":"区分连接复用和内容复用。"},{"id":"2-02-q3","prompt":"假设HTTP/1.1使用非持久连接，顺序获取一个HTML和一张图片，无DNS、TLS、传输和处理耗时，每次需TCP握手；约几个RTT？","hint":"约4 RTT：每个对象2 RTT，两个对象顺序获取；改变假设后结果会不同。"}],"base":true},{"id":"2-03","title":"Cookie、缓存与HTTP/2","kind":"reading","reading":"2.2.4—2.2.6；p.69起；读至p.76的2.3前","minutes":"65—80","output":"制作Cookie/缓存对照表；画一次缓存命中或再验证的流程。","bookPractice":"第2章复习题p.110起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"2-03-q1","prompt":"Cookie与Web缓存分别保存什么、解决什么问题？","hint":"不要把身份/状态管理与对象缓存混淆。"},{"id":"2-03-q2","prompt":"HTTP/2这一节中，哪些机制改善了多个对象的传输组织？","hint":"依本书内容比较，避免泛化为所有HTTP版本都使用同一种机制。"},{"id":"2-03-q3","prompt":"缓存命中概率0.6；命中总耗时10 ms，未命中总耗时100 ms，平均耗时是多少？","hint":"0.6×10＋0.4×100＝46 ms；未命中100 ms已是总时间。"}],"base":true},{"id":"2-04","title":"电子邮件与多协议协作","kind":"reading","reading":"2.3；p.76起；读至p.81的2.4前","minutes":"60—75","output":"画邮件发送、转发、读取流程；每个箭头标角色和用途。","bookPractice":"第2章复习题p.110起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"2-04-q1","prompt":"画一封邮件从发送到被读取的路径，标出角色。","hint":"至少区分用户代理、邮件服务器与中间转发。"},{"id":"2-04-q2","prompt":"SMTP与邮件访问协议的工作阶段有何不同？","hint":"区分发送/转发与从邮箱读取。"},{"id":"2-04-q3","prompt":"网页能打开但邮件客户端收不到邮件，为什么不能直接判断整台电脑断网？","hint":"把不同应用、目标、服务和连接分别验证；不以一个应用代表整个网络。"}],"base":true},{"id":"2-05","title":"DNS服务、解析与记录","kind":"reading","reading":"2.4；p.81起；读至p.90的2.5前","minutes":"75—90","output":"画一次域名解析流程；解释递归/迭代、缓存和两种记录类型。","bookPractice":"第2章复习题p.110起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"2-05-q1","prompt":"递归查询和迭代查询由谁继续询问下一层？","hint":"画参与者及箭头，不能只背“递归/迭代”名称。"},{"id":"2-05-q2","prompt":"A、AAAA、CNAME、MX记录分别用于哪类需求？","hint":"按本书记录类型核对，注意别名与地址记录的差别。"},{"id":"2-05-q3","prompt":"DNS刚修改但一部分客户端仍得到旧地址，给出一种合理解释及验证办法。","hint":"可以假设缓存尚有效，再查看实际响应和TTL；不是仅凭现象确定根因。"}],"base":true},{"id":"2-06","title":"P2P、视频流与CDN","kind":"reading","reading":"2.5—2.6；p.90起；读至p.102的2.7前","minutes":"75—90","output":"对照集中分发与P2P；画用户请求视频及选择内容节点的概念路径。","bookPractice":"第2章复习题p.110起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"2-06-q1","prompt":"集中分发与P2P分发的瓶颈可能分别在哪里？","hint":"分别考虑服务器总上传与各客户端接收能力。"},{"id":"2-06-q2","prompt":"CDN与“给用户提高接入带宽”有什么区别？","hint":"比较内容位置、路径与边缘分发，不能当作直接扩容用户线路。"},{"id":"2-06-q3","prompt":"理想集中分发：80 Mbit文件给4个客户端，服务器上传100 Mbit/s，每个客户端下行20 Mbit/s，无其他瓶颈；完成分发的时间下界是多少？","hint":"max(4×80/100，80/20)=4 s；这是理想下界，不是实际耗时保证。"}],"base":true},{"id":"2-07","title":"Socket示例与应用层整合","kind":"reading","reading":"2.7—2.8；p.102起；读至p.110的课后题前","minutes":"75—90","output":"逐行注释书中一个TCP或UDP示例，画进程与Socket关系；完整编程另开实验包。","bookPractice":"第2章复习题p.110起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"2-07-q1","prompt":"TCP与UDP的Socket示例中，服务端的交互流程有哪些差别？","hint":"按书中API流程逐步解释；实际运行放在自有隔离环境。"},{"id":"2-07-q2","prompt":"端口相同是否代表两个应用一定使用同一种运输协议？","hint":"区分TCP与UDP各自的端口空间和服务约定。"},{"id":"2-07-q3","prompt":"给书中的一个Socket示例换一组地址/端口，先写出需要修改和检查的项目。","hint":"检查监听地址、目标地址、端口、协议及程序状态；不要求今天搭完整实验平台。"}],"base":true},{"id":"2-R","title":"章末复习题清点与补做","kind":"review","reading":"本章全部小节；p.110起；止于p.112的“习题”前","minutes":"60—80","output":"登记全部复习题；扣除已随单元完成的题；补做一批未做题并订正。未完成则追加R-02、R-03，不标整章完成。","bookPractice":"复习题以原书为准；每批约6—10道短概念题，复杂题减少数量，以60—80分钟为限。\n\n本章原书复习题全部纳入；已做题按题号勾选，不重复抄写。","questions":[],"base":true},{"id":"2-P","title":"章末习题首批与续包入口","kind":"practice","reading":"本章分析、计算与综合问题；p.112起；止于p.116的后续作业/实验前","minutes":"70—90","output":"按原书题号建立习题清单，独立完成第一批并订正；未做完继续P-02、P-03。全章习题处理完成后才做章末闭卷互检。","bookPractice":"一批通常3—5道普通题；大题1—2道；多小问按时间拆，不能把读过答案算独立完成。\n\n原书习题默认全部纳入分批清单，不因首批结束而省略剩余题。难题可先标待补；整章闭环前须回补。编程与实验另设X包。\n\n额外实验/编程入口：p.116：套接字编程作业；p.117：HTTP、DNS实验（各自独立拆包）。每项另开X包；默认60—120分钟，不够就继续拆，不占用一个普通阅读包的全部任务量。","questions":[],"base":true}]},{"id":"3","title":"运输层","packs":[{"id":"3-01","title":"运输层、多路复用与UDP","kind":"reading","reading":"3.1—3.3；p.118起；读至p.131的3.4前","minutes":"75—90","output":"画进程—端口—主机关系图；标注UDP字段并解释校验目的。","bookPractice":"第3章复习题p.187起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"3-01-q1","prompt":"运输层与网络层的服务对象有什么区别？","hint":"用进程之间与主机之间的逻辑通信解释层次。"},{"id":"3-01-q2","prompt":"TCP/UDP多路分解时，需要考虑哪些地址和端口信息？","hint":"按照3.2的不同情境核对，不把所有协议统一成“只看目的端口”。"},{"id":"3-01-q3","prompt":"两个客户端都连接同一服务器端口，服务端怎样区分连接？","hint":"对TCP连接，结合源/目的IP和端口理解；不要只看服务器端口。"}],"base":true},{"id":"3-02","title":"可靠传输与停止等待","kind":"reading","reading":"3.4导入、3.4.1；p.131起；读至p.140的3.4.2前","minutes":"75—90","output":"手画数据损坏、数据丢失、ACK丢失三种情境，标序号、确认和超时。","bookPractice":"第3章复习题p.187起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"3-02-q1","prompt":"为什么可靠传输需要序号？","hint":"用重复到达和确认歧义说明必要性。"},{"id":"3-02-q2","prompt":"超时重传与校验和分别应对什么问题？","hint":"区分检测数据损坏和处理无法及时确认交付。"},{"id":"3-02-q3","prompt":"数据已成功到达，但ACK丢了：画出重传和接收端处理的时序。","hint":"接收端需要识别重复，避免把同一数据重复交付应用；具体过程依所学协议。"}],"base":true},{"id":"3-03","title":"流水线、回退N步与选择重传","kind":"reading","reading":"3.4.2—3.4.4；p.140起；读至p.149的3.5前","minutes":"80—95","output":"用同一个丢包例子比较GBN与SR；状态图先抓工作过程，不背全部转换。","bookPractice":"第3章复习题p.187起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"3-03-q1","prompt":"流水线如何改善停止等待的链路利用率？","hint":"观察一个RTT内可在途的数据量，不把流水线等同于多条物理链路。"},{"id":"3-03-q2","prompt":"GBN与SR在接收端缓存、确认和重传范围上怎样不同？","hint":"结合本书假设解释，不只比较“哪个快”。"},{"id":"3-03-q3","prompt":"发出0、1、2、3四个分组，1丢失，2和3已到达；分别画GBN和SR的典型处理。","hint":"GBN通常从缺失位置回退重传；SR可缓存后续分组并选择性重传1，具体按书中协议模型。"}],"base":true},{"id":"3-04","title":"TCP连接、报文、序号与RTT","kind":"reading","reading":"3.5.1—3.5.3；p.149起；读至p.156的3.5.4前","minutes":"75—90","output":"标注一个自编TCP报文；完成序号/确认号及一次RTT估计计算。","bookPractice":"第3章复习题p.187起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"3-04-q1","prompt":"TCP序号计数的是分组还是字节？","hint":"结合字节流理解，而非每个报文序号简单加1。"},{"id":"3-04-q2","prompt":"SampleRTT与平滑后的EstimatedRTT是什么关系？","hint":"解释平滑参数为什么避免估计随单次样本剧烈波动。"},{"id":"3-04-q3","prompt":"数据段首字节序号1000、净载荷500字节且按序收到，下一个期望序号是多少？若旧RTT=100 ms、新样本120 ms、α=0.125，新估计是多少？","hint":"1500；(1−0.125)×100＋0.125×120＝102.5 ms。题目未包含SYN/FIN。"}],"base":true},{"id":"3-05","title":"TCP可靠传输、窗口与连接管理","kind":"reading","reading":"3.5.4—3.5.6；p.156起；读至p.167的3.6前","minutes":"80—95","output":"画握手和关闭的基础流程；区分重传、流量控制与连接状态。","bookPractice":"第3章复习题p.187起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"3-05-q1","prompt":"接收窗口与发送端能否持续发送有什么关系？","hint":"区分接收缓存限制和网络拥塞限制。"},{"id":"3-05-q2","prompt":"连接建立、数据传输、连接关闭应怎样分开描述？","hint":"画基础流程；真实关闭报文组合不必总是固定四个独立包。"},{"id":"3-05-q3","prompt":"某端SYN序号100，对方确认它时确认号是多少？只见重复SYN，至少列三种待验证原因。","hint":"确认号101；可排查去程、回程、过滤、服务状态等，不能仅凭抓包断定某一种。"}],"base":true},{"id":"3-06","title":"拥塞原因与经典TCP拥塞控制","kind":"reading","reading":"3.6—3.7.1；p.167起；读至p.180的3.7.2前","minutes":"80—95","output":"画慢启动/拥塞避免的概念曲线；比较拥塞控制与接收端流量控制。","bookPractice":"第3章复习题p.187起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"3-06-q1","prompt":"流量控制与拥塞控制各保护什么？","hint":"接收端能力与网络路径拥塞是不同约束。"},{"id":"3-06-q2","prompt":"丢包、排队和重复传输会怎样影响有效吞吐量？","hint":"解释代价，不把更多重传视为更多有效数据。"},{"id":"3-06-q3","prompt":"理想慢启动、未到阈值且每RTT窗口翻倍，初始1 MSS，三个RTT后窗口是多少？","hint":"8 MSS；这是明确简化假设下的推演，不是所有实现的固定表现。"}],"base":true},{"id":"3-07","title":"ECN、公平性与运输层整合","kind":"reading","reading":"3.7.2—3.9；p.180起；读至p.187的课后题前","minutes":"65—80","output":"梳理书中演进内容；对比本章各类控制机制，不把教材旧例当实时实现承诺。","bookPractice":"第3章复习题p.187起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"3-07-q1","prompt":"ECN与依赖丢包推断拥塞有什么不同？","hint":"回查显式标记和发送端响应，不必背字段全部位值。"},{"id":"3-07-q2","prompt":"按流公平与按用户公平是一回事吗？","hint":"一个用户可有多条流，两个层面的公平标准不一定一致。"},{"id":"3-07-q3","prompt":"某应用改用UDP，能否据此断言可靠性、拥塞控制都不存在？说明判断边界。","hint":"不能；要看应用或其上层协议是否提供相应机制，不能仅凭底层名称下结论。"}],"base":true},{"id":"3-R","title":"章末复习题清点与补做","kind":"review","reading":"本章全部小节；p.187起；止于p.189的“习题”前","minutes":"60—80","output":"登记全部复习题；扣除已随单元完成的题；补做一批未做题并订正。未完成则追加R-02、R-03，不标整章完成。","bookPractice":"复习题以原书为准；每批约6—10道短概念题，复杂题减少数量，以60—80分钟为限。\n\n本章原书复习题全部纳入；已做题按题号勾选，不重复抄写。","questions":[],"base":true},{"id":"3-P","title":"章末习题首批与续包入口","kind":"practice","reading":"本章分析、计算与综合问题；p.189起；止于p.196的后续作业/实验前","minutes":"70—90","output":"按原书题号建立习题清单，独立完成第一批并订正；未做完继续P-02、P-03。全章习题处理完成后才做章末闭卷互检。","bookPractice":"一批通常3—5道普通题；大题1—2道；多小问按时间拆，不能把读过答案算独立完成。\n\n原书习题默认全部纳入分批清单，不因首批结束而省略剩余题。难题可先标待补；整章闭环前须回补。编程与实验另设X包。\n\n额外实验/编程入口：p.196：编程作业、TCP与UDP实验（每项另开包）。每项另开X包；默认60—120分钟，不够就继续拆，不占用一个普通阅读包的全部任务量。","questions":[],"base":true}]},{"id":"4","title":"网络层：数据平面","packs":[{"id":"4-01","title":"数据平面、路由器与转发","kind":"reading","reading":"4.1—4.2.3；p.198起；读至p.209的4.2.4前","minutes":"70—85","output":"画输入端口—交换结构—输出端口；区分查表转发与计算路由。","bookPractice":"第4章复习题p.240起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"4-01-q1","prompt":"控制平面计算路由与数据平面逐包转发如何分工？","hint":"不要把每个分组转发都解释成重新运行一次全网路由算法。"},{"id":"4-01-q2","prompt":"输入端口、交换结构和输出端口分别做什么？","hint":"画经过路径，并标出查表位置。"},{"id":"4-01-q3","prompt":"路由表含0.0.0.0/0、10.0.0.0/8、10.1.0.0/16、10.1.2.0/24；目标10.1.2.3匹配哪条前缀？","hint":"最长匹配为10.1.2.0/24；本题假定这些表项可用且无其他策略覆盖。"}],"base":true},{"id":"4-02","title":"排队位置与分组调度","kind":"reading","reading":"4.2.4—4.2.5；p.209起；读至p.216的4.3前","minutes":"70—85","output":"画输入/输出排队；用自编到达顺序手演两种调度方案。","bookPractice":"第4章复习题p.240起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"4-02-q1","prompt":"哪些条件会导致输入端口排队或输出端口排队？","hint":"比较到达速率、交换能力与输出速率，不只盯一处队列。"},{"id":"4-02-q2","prompt":"FIFO、优先级调度与公平调度的关注点有何不同？","hint":"先说选择下一个分组的规则，再比较取舍。"},{"id":"4-02-q3","prompt":"总有高优先级流量到达时，低优先级流量可能遇到什么问题？你会查看什么证据？","hint":"关注饥饿、队列积压和实际服务情况；不是所有队列满都由同一个原因造成。"}],"base":true},{"id":"4-03","title":"IPv4报文、编址与子网","kind":"reading","reading":"4.3.1—4.3.2；p.216起；读至p.226的4.3.3前","minutes":"80—95","output":"完成子网和最长前缀匹配练习；画接口、地址和子网的关系。","bookPractice":"第4章复习题p.240起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"4-03-q1","prompt":"IPv4地址属于接口还是抽象的“唯一一台设备”？","hint":"考虑一台设备多个接口的情况。"},{"id":"4-03-q2","prompt":"同一路由表存在多个匹配前缀时，怎样选择？","hint":"使用最长前缀原则；不要比较地址数值大小决定优先。"},{"id":"4-03-q3","prompt":"计算192.168.10.70/26的网络地址、广播地址和常规可用主机范围。","hint":"网络192.168.10.64，广播.127，常规主机.65—.126；本题为普通/26。"}],"base":true},{"id":"4-04","title":"NAT与IPv6","kind":"reading","reading":"4.3.3—4.3.4；p.226起；读至p.232的4.4前","minutes":"70—85","output":"画NAT前后五元组；识别IPv6基本结构，不能把NAT等同于安全授权。","bookPractice":"第4章复习题p.240起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"4-04-q1","prompt":"NAT改变哪些报文字段，为什么需要转换记录？","hint":"按题设具体转换讨论，不认为每一种NAT都改动同样字段。"},{"id":"4-04-q2","prompt":"IPv6这一节主要试图解决或改变什么？","hint":"根据本书比较地址空间和报文结构，别只记“地址更长”。"},{"id":"4-04-q3","prompt":"内部192.168.10.2:50000访问203.0.113.10:443，被映射为198.51.100.5:62000；写转换前后TCP五元组。","hint":"源地址/端口改变，目的203.0.113.10:443和TCP保持；NAT本身不等于访问获准。"}],"base":true},{"id":"4-05","title":"泛化转发、SDN与中间盒","kind":"reading","reading":"4.4—4.6；p.232起；读至p.240的课后题前","minutes":"70—85","output":"将三条自编业务需求写成“匹配—操作”；区分转发、策略与设备形态。","bookPractice":"第4章复习题p.240起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"4-05-q1","prompt":"传统基于目的IP转发与泛化匹配有什么区别？","hint":"说明可匹配的字段和可执行的动作，不必使用特定设备语法。"},{"id":"4-05-q2","prompt":"中间盒、转发设备和SDN控制器是同一类角色吗？","hint":"按实际职责区分，不能用物理/虚拟外形替代功能判断。"},{"id":"4-05-q3","prompt":"把“只允许办公网访问测试服务器443”写成匹配条件与动作，另列尚未明确的条件。","hint":"明确源/目的地址、协议、目的端口、方向等；真实规则还需具体平台语义。"}],"base":true},{"id":"4-R","title":"章末复习题清点与补做","kind":"review","reading":"本章全部小节；p.240起；止于p.241的“习题”前","minutes":"60—80","output":"登记全部复习题；扣除已随单元完成的题；补做一批未做题并订正。未完成则追加R-02、R-03，不标整章完成。","bookPractice":"复习题以原书为准；每批约6—10道短概念题，复杂题减少数量，以60—80分钟为限。\n\n本章原书复习题全部纳入；已做题按题号勾选，不重复抄写。","questions":[],"base":true},{"id":"4-P","title":"章末习题首批与续包入口","kind":"practice","reading":"本章分析、计算与综合问题；p.241起；止于p.245的后续作业/实验前","minutes":"70—90","output":"按原书题号建立习题清单，独立完成第一批并订正；未做完继续P-02、P-03。全章习题处理完成后才做章末闭卷互检。","bookPractice":"一批通常3—5道普通题；大题1—2道；多小问按时间拆，不能把读过答案算独立完成。\n\n原书习题默认全部纳入分批清单，不因首批结束而省略剩余题。难题可先标待补；整章闭环前须回补。编程与实验另设X包。\n\n额外实验/编程入口：p.245：IP实验（独立选做包）。每项另开X包；默认60—120分钟，不够就继续拆，不占用一个普通阅读包的全部任务量。","questions":[],"base":true}]},{"id":"5","title":"网络层：控制平面","packs":[{"id":"5-01","title":"控制平面与路由选择算法","kind":"reading","reading":"5.1—5.2；p.247起；读至p.259的5.3前","minutes":"80—95","output":"手算一个小图的最短路径；比较链路状态与距离向量，不做大图穷举。","bookPractice":"第5章复习题p.287起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"5-01-q1","prompt":"链路状态与距离向量交换的信息有什么不同？","hint":"比较知道拓扑与逐邻居距离更新的思路。"},{"id":"5-01-q2","prompt":"路由算法、路由协议与转发表是什么关系？","hint":"分别说明计算方法、交换信息机制和实际转发所用结果。"},{"id":"5-01-q3","prompt":"无向图A-B=2、A-C=5、B-C=1、B-D=4、C-D=1：算A到D最短路径和总代价。","hint":"A→B→C→D，代价4；写出中间比较过程而不只填结果。"}],"base":true},{"id":"5-02","title":"OSPF、自治系统与BGP","kind":"reading","reading":"5.3—5.4；p.259起；读至p.270的5.5前","minutes":"75—90","output":"画两个自治系统；说明域内与域间路由的职责，暂不学厂商复杂配置。","bookPractice":"第5章复习题p.287起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"5-02-q1","prompt":"为什么要区分域内和域间路由？","hint":"从规模、自治和策略需求解释。"},{"id":"5-02-q2","prompt":"OSPF与BGP在目标、信息和策略上有什么差别？","hint":"不能简单说BGP是“更高级OSPF”或只选地理最短路线。"},{"id":"5-02-q3","prompt":"画两个自治系统，各有多台路由器；把域内协议和边界上的域间关系标出来。","hint":"角色和边界要自洽；暂不要求完整iBGP配置细节。"}],"base":true},{"id":"5-03","title":"SDN控制平面","kind":"reading","reading":"5.5；p.270起；读至p.277的5.6前","minutes":"65—80","output":"画控制器、网络应用与转发设备；用一次规则安装解释控制/数据的分工。","bookPractice":"第5章复习题p.287起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"5-03-q1","prompt":"SDN控制器与网络控制应用分别扮演什么角色？","hint":"按书中体系标出上层应用、控制器和设备。"},{"id":"5-03-q2","prompt":"集中控制是否意味着每个业务包必须经过控制器？","hint":"区分控制信息路径与数据路径，不作不必要的绝对化判断。"},{"id":"5-03-q3","prompt":"画一次业务规则从意图到下发再到数据转发的过程。","hint":"分别标出管理/控制箭头和业务流箭头。"}],"base":true},{"id":"5-04","title":"ICMP、网络管理与章节整合","kind":"reading","reading":"5.6—5.8；p.277起；读至p.287的课后题前","minutes":"70—85","output":"列一张排障证据表；比较SNMP、NETCONF/YANG的用途；做本章主线图。","bookPractice":"第5章复习题p.287起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"5-04-q1","prompt":"ICMP主要承担哪些与IP有关的反馈用途？","hint":"把控制/差错反馈与应用业务本身分开。"},{"id":"5-04-q2","prompt":"SNMP与NETCONF/YANG分别怎样帮助管理网络？","hint":"分别查管理信息/操作模型，避免把协议与数据模型混为一谈。"},{"id":"5-04-q3","prompt":"traceroute中一跳没有回应，但后面的跳能回应，为什么不能立刻认定那一跳断网？","hint":"中间设备的回复行为与转发能力不是同一证据；结合后续跳与业务测试。"}],"base":true},{"id":"5-R","title":"章末复习题清点与补做","kind":"review","reading":"本章全部小节；p.287起；止于p.288的“习题”前","minutes":"60—80","output":"登记全部复习题；扣除已随单元完成的题；补做一批未做题并订正。未完成则追加R-02、R-03，不标整章完成。","bookPractice":"复习题以原书为准；每批约6—10道短概念题，复杂题减少数量，以60—80分钟为限。\n\n本章原书复习题全部纳入；已做题按题号勾选，不重复抄写。","questions":[],"base":true},{"id":"5-P","title":"章末习题首批与续包入口","kind":"practice","reading":"本章分析、计算与综合问题；p.288起；止于p.291的后续作业/实验前","minutes":"70—90","output":"按原书题号建立习题清单，独立完成第一批并订正；未做完继续P-02、P-03。全章习题处理完成后才做章末闭卷互检。","bookPractice":"一批通常3—5道普通题；大题1—2道；多小问按时间拆，不能把读过答案算独立完成。\n\n原书习题默认全部纳入分批清单，不因首批结束而省略剩余题。难题可先标待补；整章闭环前须回补。编程与实验另设X包。\n\n额外实验/编程入口：p.291：套接字编程作业、编程作业；p.292：ICMP实验。每项另开X包；默认60—120分钟，不够就继续拆，不占用一个普通阅读包的全部任务量。","questions":[],"base":true}]},{"id":"6","title":"链路层和局域网","packs":[{"id":"6-01","title":"链路服务与差错检测","kind":"reading","reading":"6.1—6.2；p.294起；读至p.301的6.3前","minutes":"70—90","output":"完成奇偶校验/简单CRC练习；区分检测到差错和修复差错。","bookPractice":"第6章复习题p.341起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"6-01-q1","prompt":"链路层可提供哪些服务？每条链路都提供全部服务吗？","hint":"按具体链路技术讨论，不把可选服务当作全部必有。"},{"id":"6-01-q2","prompt":"差错检测与差错纠正有什么区别？","hint":"说明发现错误、定位错误与修复错误的不同。"},{"id":"6-01-q3","prompt":"数据位1011001采用一个偶校验位，该位应取什么值？这个校验能发现所有错误吗？","hint":"数据有4个1，校验位0；偶数个比特翻转可能漏检。"}],"base":true},{"id":"6-02","title":"多路访问与共享介质","kind":"reading","reading":"6.3；p.301起；读至p.311的6.4前","minutes":"70—85","output":"比较划分、随机接入、轮流接入；画一个冲突场景并解释改进条件。","bookPractice":"第6章复习题p.341起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"6-02-q1","prompt":"信道划分、随机接入和轮流接入各适合什么场景？","hint":"比较空闲浪费、碰撞与协调开销。"},{"id":"6-02-q2","prompt":"隐藏终端情境中，为什么“我没听到别人发送”不保证接收端无冲突？","hint":"关注感知位置与接收位置不同。"},{"id":"6-02-q3","prompt":"画A、B都能到C，但A、B互相听不到的图，说明一次冲突如何发生。","hint":"题图要明确听得到/听不到关系；不要求进行任何真实无线干扰。"}],"base":true},{"id":"6-03","title":"MAC、ARP与以太网","kind":"reading","reading":"6.4导入、6.4.1—6.4.2；p.311起；读至p.322的6.4.3前","minutes":"75—90","output":"画同子网/跨子网发送前的ARP过程；标出以太网帧的主要字段。","bookPractice":"第6章复习题p.341起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"6-03-q1","prompt":"IP地址与MAC地址的作用分别是什么？","hint":"区分网络层目的与本地链路交付对象。"},{"id":"6-03-q2","prompt":"ARP表与交换机MAC地址表各保存什么映射？","hint":"主机IP到MAC映射，与交换机MAC到端口的学习表不同。"},{"id":"6-03-q3","prompt":"172.16.1.10/24要访问172.16.2.10，默认网关172.16.1.1且无特殊路由：它首先需要解析哪个下一跳的MAC？","hint":"应解析本地网关172.16.1.1的MAC，不是直接在本地ARP远端主机。"}],"base":true},{"id":"6-04","title":"交换学习、转发与VLAN","kind":"reading","reading":"6.4.3—6.4.4；p.322起；读至p.328的6.5前","minutes":"70—85","output":"手演MAC表学习；画双交换机与两个VLAN，不预设已经掌握H3C命令。","bookPractice":"第6章复习题p.341起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"6-04-q1","prompt":"交换机根据源MAC还是目的MAC学习表项？转发又看什么？","hint":"学习看源地址和入端口，转发查目的；未知目的的处理还需结合VLAN等条件。"},{"id":"6-04-q2","prompt":"VLAN与IP子网为什么相关却不应混为同一概念？","hint":"二层广播域与三层编址属于不同层次。"},{"id":"6-04-q3","prompt":"两台交换机各有VLAN10终端，中间链路没传递VLAN10；写一份检查清单。","hint":"先核对端口/VLAN/链路承载，再查主机配置；本份只写原理，不编造厂商命令。"}],"base":true},{"id":"6-05","title":"链路虚拟化与数据中心网络","kind":"reading","reading":"6.5—6.6；p.328起；读至p.336的6.7前","minutes":"65—80","output":"画封装/逻辑链路示意；说明数据中心多路径与普通小型网络的差别。","bookPractice":"第6章复习题p.341起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"6-05-q1","prompt":"链路虚拟化使哪一层能够把网络看作一条逻辑链路？","hint":"按本书6.5的具体例子解释抽象关系，不把所有虚拟网络视为同一实现。"},{"id":"6-05-q2","prompt":"数据中心网络为什么关注多路径、扩展性和东西向通信？","hint":"结合大量服务器相互通信的需求。"},{"id":"6-05-q3","prompt":"画外层封装承载内层报文的示意，并标注你目前不确定的字段。","hint":"这里只要求角色和封装关系；不要求凭空补齐未知格式。"}],"base":true},{"id":"6-06","title":"从DHCP到网页的完整访问","kind":"reading","reading":"6.7—6.8；p.336起；读至p.341的课后题前","minutes":"70—85","output":"画DHCP、ARP、DNS、路由、TCP与HTTP的依赖和交互图；按具体拓扑注明ARP发生位置、缓存和连接等前提，不把这些协议写成固定通用的先后顺序。","bookPractice":"第6章复习题p.341起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"6-06-q1","prompt":"拿到IP地址、解析域名和建立TCP连接分别解决什么问题？","hint":"对应DHCP、DNS与TCP；把地址分配和路由选择分开。"},{"id":"6-06-q2","prompt":"缓存存在时，哪些步骤可能不再按首次访问方式执行？","hint":"依具体缓存与连接复用状态判断，不能认为每次都有相同报文序列。"},{"id":"6-06-q3","prompt":"从一台刚入网的测试主机开始，画获取网页的完整过程并注明前提。","hint":"说明IPv4、是否有缓存/既有连接、是否明文HTTP等假设；图中顺序要自洽。"}],"base":true},{"id":"6-R","title":"章末复习题清点与补做","kind":"review","reading":"本章全部小节；p.341起；止于p.342的“习题”前","minutes":"60—80","output":"登记全部复习题；扣除已随单元完成的题；补做一批未做题并订正。未完成则追加R-02、R-03，不标整章完成。","bookPractice":"复习题以原书为准；每批约6—10道短概念题，复杂题减少数量，以60—80分钟为限。\n\n本章原书复习题全部纳入；已做题按题号勾选，不重复抄写。","questions":[],"base":true},{"id":"6-P","title":"章末习题首批与续包入口","kind":"practice","reading":"本章分析、计算与综合问题；p.342起；止于p.346的后续作业/实验前","minutes":"70—90","output":"按原书题号建立习题清单，独立完成第一批并订正；未做完继续P-02、P-03。全章习题处理完成后才做章末闭卷互检。","bookPractice":"一批通常3—5道普通题；大题1—2道；多小问按时间拆，不能把读过答案算独立完成。\n\n原书习题默认全部纳入分批清单，不因首批结束而省略剩余题。难题可先标待补；整章闭环前须回补。编程与实验另设X包。\n\n额外实验/编程入口：p.346：802.3以太网实验（独立选做包）。每项另开X包；默认60—120分钟，不够就继续拆，不占用一个普通阅读包的全部任务量。","questions":[],"base":true}]},{"id":"7","title":"无线网络和移动网络","packs":[{"id":"7-01","title":"无线网络组成与链路特征","kind":"reading","reading":"7.1—7.2；p.348起；读至p.356的7.3前","minutes":"65—80","output":"列无线链路诊断问题；区分无线接入状态、IP配置与应用状态。","bookPractice":"第7章复习题p.393起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"7-01-q1","prompt":"无线链路与有线链路在干扰、信号和共享方面有何区别？","hint":"用环境变化和介质特性解释，不等同于“无线一定慢”。"},{"id":"7-01-q2","prompt":"无线连接成功、获得IP和业务可用为什么是不同检查层面？","hint":"分别验证接入、配置和端到端服务。"},{"id":"7-01-q3","prompt":"“Wi-Fi满格但网页慢”，提出三条不同层面的待验证假设。","hint":"可以从链路质量/拥塞、名称解析、上游路径/服务等提出假设，不能只看信号格数。"}],"base":true},{"id":"7-02","title":"WiFi结构、MAC与移动性","kind":"reading","reading":"7.3；p.356起；读至p.369的7.4前","minutes":"80—95","output":"画AP、终端及接入过程；比较碰撞避免与碰撞检测，标准名不死记。","bookPractice":"第7章复习题p.393起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"7-02-q1","prompt":"AP、BSS与分布系统之间是什么关系？","hint":"照本书结构画图，不强求复杂园区漫游设计。"},{"id":"7-02-q2","prompt":"碰撞避免与碰撞检测的策略区别是什么？","hint":"结合无线感知限制理解；不要简单等同为“永远没有碰撞”。"},{"id":"7-02-q3","prompt":"只读记录自己网络的频段、信道和连接速率；说明这些信息还不能证明什么。","hint":"不能仅凭协商速率证明实际吞吐量、端到端延迟或安全配置正确。"}],"base":true},{"id":"7-03","title":"4G/5G与蜂窝网络","kind":"reading","reading":"7.4；p.369起；读至p.380的7.5前","minutes":"70—85","output":"画接入网和核心网的角色；按本书理解，不把书中版本当最新行业全景。","bookPractice":"第7章复习题p.393起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"7-03-q1","prompt":"蜂窝接入网和核心网分别负责哪些事？","hint":"以本书4G/5G架构为准，只抓核心角色。"},{"id":"7-03-q2","prompt":"认证、移动性与用户数据转发为什么需要协作？","hint":"分别写控制/管理与数据承载的职责。"},{"id":"7-03-q3","prompt":"画手机访问一个服务器的概念路径，圈出与家用Wi-Fi相似和不同的角色。","hint":"保留本书范围，不延伸为当前所有运营商实际部署的断言。"}],"base":true},{"id":"7-04","title":"移动性管理与高层影响","kind":"reading","reading":"7.5—7.8；p.380起；读至p.393的课后题前","minutes":"70—85","output":"画归属/被访网络和间接路由；说明移动后地址、路径和会话的变化。","bookPractice":"第7章复习题p.393起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"7-04-q1","prompt":"归属网络与被访网络是什么关系？","hint":"结合移动用户位置与身份/地址管理解释。"},{"id":"7-04-q2","prompt":"间接路由与直接路由分别有什么收益和成本？","hint":"比较绕行、位置更新和连续性，不能只按跳数选。"},{"id":"7-04-q3","prompt":"移动设备换接入点后应用断开，应区分哪些可能发生变化的状态？","hint":"检查链路、IP、路由、认证、连接状态等，不认定换接入必然或必不引起地址变化。"}],"base":true},{"id":"7-R","title":"章末复习题清点与补做","kind":"review","reading":"本章全部小节；p.393起；止于p.394的“习题”前","minutes":"60—80","output":"登记全部复习题；扣除已随单元完成的题；补做一批未做题并订正。未完成则追加R-02、R-03，不标整章完成。","bookPractice":"复习题以原书为准；每批约6—10道短概念题，复杂题减少数量，以60—80分钟为限。\n\n本章原书复习题全部纳入；已做题按题号勾选，不重复抄写。","questions":[],"base":true},{"id":"7-P","title":"章末习题首批与续包入口","kind":"practice","reading":"本章分析、计算与综合问题；p.394起；止于p.396的后续作业/实验前","minutes":"70—90","output":"按原书题号建立习题清单，独立完成第一批并订正；未做完继续P-02、P-03。全章习题处理完成后才做章末闭卷互检。","bookPractice":"一批通常3—5道普通题；大题1—2道；多小问按时间拆，不能把读过答案算独立完成。\n\n原书习题默认全部纳入分批清单，不因首批结束而省略剩余题。难题可先标待补；整章闭环前须回补。编程与实验另设X包。\n\n额外实验/编程入口：p.396：WiFi实验（独立选做包）。每项另开X包；默认60—120分钟，不够就继续拆，不占用一个普通阅读包的全部任务量。","questions":[],"base":true}]},{"id":"8","title":"计算机网络中的安全","packs":[{"id":"8-01","title":"安全目标与密码学基础","kind":"reading","reading":"8.1—8.2；p.398起；读至p.409的8.3前","minutes":"75—90","output":"区分安全目标和密码机制；画对称/公开密钥加密角色，不深挖数学证明。","bookPractice":"第8章复习题p.447起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"8-01-q1","prompt":"保密性、完整性与可用性是同一个目标吗？","hint":"为每个目标举出不同反例。"},{"id":"8-01-q2","prompt":"对称密钥与公开密钥体系各有哪些角色和使用条件？","hint":"分清公钥、私钥、共享密钥，不深入未学的数学证明。"},{"id":"8-01-q3","prompt":"为“文件只能由指定人阅读、还要确认是谁发的”拆分安全需求，而不是直接写一个算法名。","hint":"分别讨论保密、完整性、来源鉴别与密钥信任条件。"}],"base":true},{"id":"8-02","title":"完整性、数字签名与端点鉴别","kind":"reading","reading":"8.3—8.4；p.409起；读至p.419的8.5前","minutes":"75—90","output":"比较散列、MAC、签名；画挑战—响应过程，说明重放问题。","bookPractice":"第8章复习题p.447起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"8-02-q1","prompt":"散列、报文鉴别码与数字签名有什么不同？","hint":"比较是否需要秘密/私钥、验证者和安全目标。"},{"id":"8-02-q2","prompt":"为什么验证了消息内容还不一定证明消息是新鲜的？","hint":"回查重放、随机数/时效信息，区别完整性与新鲜性。"},{"id":"8-02-q3","prompt":"设计一个仅含角色和随机挑战的鉴别流程草图，说明它如何帮助发现重放。","hint":"只讨论防御性概念与前提；不要求设计可直接投入生产的密码协议。"}],"base":true},{"id":"8-03","title":"安全邮件与TLS","kind":"reading","reading":"8.5—8.6；p.419起；读至p.427的8.7前","minutes":"70—85","output":"画安全邮件或TLS的概念流程；理解证书/密钥角色，不将教材流程泛化到全部TLS版本。","bookPractice":"第8章复习题p.447起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"8-03-q1","prompt":"安全邮件与TLS主要保护的交互范围有什么不同？","hint":"分别画消息保护与连接保护的概念范围。"},{"id":"8-03-q2","prompt":"证书、公钥与会话密钥分别起什么作用？","hint":"不把证书等同于“所有内容直接用同一把公钥加密”。"},{"id":"8-03-q3","prompt":"浏览器报告证书域名不匹配，但TCP已连通：把网络连通与身份验证问题分开说明。","hint":"TCP连通不足以证明身份验证通过；不把忽略错误作为修复。"}],"base":true},{"id":"8-04","title":"IPsec与VPN","kind":"reading","reading":"8.7；p.427起；读至p.433的8.8前","minutes":"70—85","output":"画站点间VPN；区分隧道、路由、认证与授权，具体配置留给设备教材。","bookPractice":"第8章复习题p.447起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"8-04-q1","prompt":"IPsec隧道中，内层地址与外层地址怎样分工？","hint":"依据本书模式区分封装关系，不能把所有VPN当同一协议。"},{"id":"8-04-q2","prompt":"安全关联和密钥协商解决什么问题？","hint":"区分保护参数、状态和协商过程；设备命令另学。"},{"id":"8-04-q3","prompt":"VPN显示已建立但访问不了服务器，列出隧道之外仍应验证的条件。","hint":"核对路由、策略、地址、返回路径和目标服务等，不能只凭隧道状态判断业务。"}],"base":true},{"id":"8-05","title":"无线与蜂窝网络安全","kind":"reading","reading":"8.8；p.433起；读至p.439的8.9前","minutes":"65—80","output":"列认证、密钥协商、数据保护的分工；只读自有网络信息，不修改生产配置。","bookPractice":"第8章复习题p.447起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"8-05-q1","prompt":"无线接入认证和数据加密分别保护什么？","hint":"接入资格、密钥建立和数据机密性分别解释。"},{"id":"8-05-q2","prompt":"无线接入层加密与应用层TLS的保护边界相同吗？","hint":"比较保护终点与信任边界，不认为一种机制自动替代另一种。"},{"id":"8-05-q3","prompt":"画终端—AP—上游—服务器，标出不同保护机制覆盖的链路或连接。","hint":"按实际假设标记，未确认的网络配置写未知。"}],"base":true},{"id":"8-06","title":"防火墙、入侵检测与安全整合","kind":"reading","reading":"8.9—8.10；p.439起；读至p.447的课后题前","minutes":"75—90","output":"画三安全区业务访问矩阵；区分策略、日志、告警和已证实的安全事件。","bookPractice":"第8章复习题p.447起；按小节/题干主题找题并记录实际题号，未指定不存在的R/P编号。 先做2道对应题，其余进入本章R包。","questions":[{"id":"8-06-q1","prompt":"包过滤、状态检查与入侵检测侧重什么不同证据？","hint":"依据本书区分策略判定、连接状态和异常检测。"},{"id":"8-06-q2","prompt":"一条拒绝日志为什么不等于已经证实发生攻击？","hint":"需结合背景、时间、资产、行为和更多证据；日志本身不是最终定性。"},{"id":"8-06-q3","prompt":"为办公区、服务器区、管理区写3条最小访问需求，并注明源、目的、服务与验证办法。","hint":"规则先用业务语言说明；不要套用所有厂商通用的NAT/路由/策略顺序。"}],"base":true},{"id":"8-R","title":"章末复习题清点与补做","kind":"review","reading":"本章全部小节；p.447起；止于p.449的“习题”前","minutes":"60—80","output":"登记全部复习题；扣除已随单元完成的题；补做一批未做题并订正。未完成则追加R-02、R-03，不标整章完成。","bookPractice":"复习题以原书为准；每批约6—10道短概念题，复杂题减少数量，以60—80分钟为限。\n\n本章原书复习题全部纳入；已做题按题号勾选，不重复抄写。","questions":[],"base":true},{"id":"8-P","title":"章末习题首批与续包入口","kind":"practice","reading":"本章分析、计算与综合问题；p.449起；止于p.452的后续作业/实验前","minutes":"70—90","output":"按原书题号建立习题清单，独立完成第一批并订正；未做完继续P-02、P-03。全章习题处理完成后才做章末闭卷互检。","bookPractice":"一批通常3—5道普通题；大题1—2道；多小问按时间拆，不能把读过答案算独立完成。\n\n原书习题默认全部纳入分批清单，不因首批结束而省略剩余题。难题可先标待补；整章闭环前须回补。编程与实验另设X包。\n\n额外实验/编程入口：p.452：TLS实验、IPsec实验（各自独立拆包）。每项另开X包；默认60—120分钟，不够就继续拆，不占用一个普通阅读包的全部任务量。","questions":[],"base":true}]}]}$networking$::jsonb,'computer-networking'
from public.study_records r
where r.kind<>'project' and r.payload->>'projectId'='computer-networking'
  and not exists(select 1 from public.study_records p where p.room_id=r.room_id and p.kind='project' and p.id='computer-networking')
group by r.room_id on conflict do nothing;

-- Backfill project membership only when absent. Existing v2 member removals remain intact on rerun.
update public.study_records p set payload = p.payload || jsonb_build_object(
  'id',p.id,'ownerId',p.owner_id::text,'revision',p.revision,
  'memberIds',case when jsonb_typeof(p.payload->'memberIds')='array' then p.payload->'memberIds' else
    coalesce((select jsonb_agg(m.user_id::text order by m.seat) from public.study_members m where m.room_id=p.room_id),'[]'::jsonb) end,
  'formerMemberIds',case when jsonb_typeof(p.payload->'formerMemberIds')='array' then p.payload->'formerMemberIds' else '[]'::jsonb end)
where p.kind='project';
update public.study_records set project_id = case when kind='project' then id else payload->>'projectId' end
where project_id is distinct from case when kind='project' then id else payload->>'projectId' end;

alter table public.study_rooms enable row level security;
alter table public.study_members enable row level security;
alter table public.study_records enable row level security;
revoke all on public.study_rooms,public.study_members,public.study_records from public,anon,authenticated;
grant select on public.study_rooms,public.study_members,public.study_records to authenticated;

create or replace function study_private.my_room_id()
returns uuid language sql stable security definer set search_path=''
as $$ select room_id from public.study_members where user_id=(select auth.uid()); $$;
create or replace function study_private.can_read_project(p_room uuid,p_project text)
returns boolean language sql stable security definer set search_path=''
as $$
  select p_room=(select study_private.my_room_id()) and exists (
    select 1 from public.study_records p where p.room_id=p_room and p.kind='project' and p.id=p_project
      and coalesce(p.payload->'memberIds','[]'::jsonb) ? (select auth.uid())::text
  );
$$;
revoke all on function study_private.my_room_id(),study_private.can_read_project(uuid,text) from public,anon;
grant execute on function study_private.my_room_id(),study_private.can_read_project(uuid,text) to authenticated;

drop policy if exists study_room_read on public.study_rooms;
create policy study_room_read on public.study_rooms for select to authenticated using(id=(select study_private.my_room_id()));
drop policy if exists study_member_read on public.study_members;
create policy study_member_read on public.study_members for select to authenticated using(room_id=(select study_private.my_room_id()));
drop policy if exists study_record_read on public.study_records;
create policy study_record_read on public.study_records for select to authenticated using(study_private.can_read_project(room_id,project_id));
drop policy if exists study_record_insert on public.study_records;
drop policy if exists study_record_update on public.study_records;

-- Retire all public self-provisioning/invitation endpoints from v1.
drop function if exists public.study_create_room(text,text);
drop function if exists public.study_join_room(text,text);
drop function if exists study_private.create_room(text,text);
drop function if exists study_private.join_room(text,text);
drop function if exists public.study_save_record(uuid,text,text,jsonb);
drop function if exists study_private.validate_record();

-- Shape checks match the browser's import validator, before malformed rows can enter shared state.
create or replace function study_private.valid_text(v jsonb,p_max integer,p_nonempty boolean default false)
returns boolean language sql immutable set search_path=''
as $$ select coalesce(pg_catalog.jsonb_typeof(v)='string' and char_length(v#>>'{}')<=p_max and (not p_nonempty or btrim(v#>>'{}')<>''),false); $$;
create or replace function study_private.valid_id(v jsonb)
returns boolean language sql immutable set search_path=''
as $$ select study_private.valid_text(v,200,true) and (v#>>'{}') !~ '[\x00-\x1f\x7f]'; $$;
create or replace function study_private.valid_timestamp(v jsonb)
returns boolean language plpgsql immutable set search_path=''
as $$
begin
  if not study_private.valid_text(v,40,true) or (v#>>'{}') !~ '^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$' then return false; end if;
  perform (v#>>'{}')::timestamptz; return true;
exception when others then return false;
end;
$$;
create or replace function study_private.valid_date(v jsonb)
returns boolean language plpgsql immutable set search_path=''
as $$
begin
  if not study_private.valid_text(v,10,true) or (v#>>'{}') !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
  perform (v#>>'{}')::date; return true;
exception when others then return false;
end;
$$;
create or replace function study_private.validate_project(p jsonb,p_old jsonb)
returns void language plpgsql stable set search_path=''
as $$
declare
  c jsonb; k jsonb; q jsonb; oc jsonb; ok jsonb; oq jsonb; nc jsonb; nk jsonb;
  chapter_ids text[] := '{}'; pack_ids text[] := '{}'; question_ids text[];
  pack_count integer := 0; question_count integer := 0;
begin
  if not study_private.valid_id(p->'id') or not study_private.valid_text(p->'title',500,true) or
     not study_private.valid_text(p->'subtitle',1000) or not study_private.valid_text(p->'description',100000) or
     coalesce(p->>'kind','') not in ('book','project') or coalesce(p->>'color','') !~ '^#[0-9a-fA-F]{6}$' or
     pg_catalog.jsonb_typeof(p->'chapters') is distinct from 'array' then
    raise exception '书籍基本信息不完整。' using errcode='22023';
  end if;
  if pg_catalog.jsonb_array_length(p->'chapters') not between 1 and 500 then raise exception '书籍至少需要一个章节。' using errcode='22023'; end if;
  if p ? 'timeZone' and (not study_private.valid_text(p->'timeZone',100,true) or not exists(select 1 from pg_catalog.pg_timezone_names where name=p->>'timeZone')) then
    raise exception '学习日历时区不正确。' using errcode='22023';
  end if;
  if p ? 'deletedPackIds' then
    if pg_catalog.jsonb_typeof(p->'deletedPackIds') is distinct from 'array' then raise exception '删除记录格式不正确。' using errcode='22023'; end if;
    if pg_catalog.jsonb_array_length(p->'deletedPackIds')>20000 or exists(
      select 1 from pg_catalog.jsonb_array_elements(p->'deletedPackIds') x where not study_private.valid_id(x)
    ) then raise exception '删除记录格式不正确。' using errcode='22023'; end if;
  end if;
  if p_old is not null and not (coalesce(p->'deletedPackIds','[]'::jsonb) @> coalesce(p_old->'deletedPackIds','[]'::jsonb)) then
    raise exception '已删除的学习包不能恢复，请同步最新书籍。' using errcode='22023';
  end if;
  if p ? 'deletedQuestionIds' then
    if pg_catalog.jsonb_typeof(p->'deletedQuestionIds') is distinct from 'object' then raise exception '习题删除记录格式不正确。' using errcode='22023'; end if;
    for nc in select pg_catalog.jsonb_build_object('id',key,'ids',value) from pg_catalog.jsonb_each(p->'deletedQuestionIds') loop
      if not study_private.valid_id(nc->'id') or pg_catalog.jsonb_typeof(nc->'ids') is distinct from 'array' then raise exception '习题删除记录格式不正确。' using errcode='22023'; end if;
      if pg_catalog.jsonb_array_length(nc->'ids')>1000 or exists(select 1 from pg_catalog.jsonb_array_elements(nc->'ids') x where not study_private.valid_id(x)) then raise exception '习题删除记录格式不正确。' using errcode='22023'; end if;
    end loop;
  end if;
  if p_old is not null and not (coalesce(p->'deletedQuestionIds','{}'::jsonb) @> coalesce(p_old->'deletedQuestionIds','{}'::jsonb)) then
    raise exception '已删除的习题不能恢复，请同步最新书籍。' using errcode='22023';
  end if;
  for c in select value from pg_catalog.jsonb_array_elements(p->'chapters') loop
    if not study_private.valid_id(c->'id') or (c->>'id')=any(chapter_ids) or not study_private.valid_text(c->'title',500,true) or pg_catalog.jsonb_typeof(c->'packs') is distinct from 'array' then
      raise exception '章节名称、编号或学习包不正确。' using errcode='22023';
    end if;
    chapter_ids := array_append(chapter_ids,c->>'id');
    if pg_catalog.jsonb_array_length(c->'packs') not between 1 and 2000 then raise exception '每章至少需要一个学习包。' using errcode='22023'; end if;
    for k in select value from pg_catalog.jsonb_array_elements(c->'packs') loop
      if coalesce(p->'deletedPackIds','[]'::jsonb) ? (k->>'id') then
        raise exception '已删除的旧学习包不能重新上传。' using errcode='22023';
      end if;
      pack_count := pack_count+1;
      if pack_count>20000 or not study_private.valid_id(k->'id') or (k->>'id')=any(pack_ids) or not study_private.valid_text(k->'title',500,true) or
         coalesce(k->>'kind','') not in ('reading','review','practice','lab') or not study_private.valid_text(k->'reading',100000) or
         not study_private.valid_text(k->'minutes',200) or not study_private.valid_text(k->'output',100000) or not study_private.valid_text(k->'bookPractice',100000) or
         pg_catalog.jsonb_typeof(k->'base') is distinct from 'boolean' or pg_catalog.jsonb_typeof(k->'questions') is distinct from 'array' then
        raise exception '学习包信息不完整或编号重复。' using errcode='22023';
      end if;
      pack_ids := array_append(pack_ids,k->>'id'); question_ids := '{}';
      if pg_catalog.jsonb_array_length(k->'questions')>1000 then raise exception '单个学习包的题目过多。' using errcode='22023'; end if;
      for q in select value from pg_catalog.jsonb_array_elements(k->'questions') loop
        if coalesce(p->'deletedQuestionIds'->(k->>'id'),'[]'::jsonb) ? (q->>'id') then raise exception '已删除的习题不能重新上传。' using errcode='22023'; end if;
        question_count := question_count+1;
        if question_count>100000 or not study_private.valid_id(q->'id') or (q->>'id')=any(question_ids) or not study_private.valid_text(q->'prompt',100000,true) or
           (q ? 'hint' and not study_private.valid_text(q->'hint',100000)) then raise exception '题目内容或编号不正确。' using errcode='22023'; end if;
        question_ids := array_append(question_ids,q->>'id');
      end loop;
    end loop;
  end loop;
  -- Existing chapter/pack/question identities stay stable so historical records retain their references.
  if p_old is not null then
    for oc in select value from pg_catalog.jsonb_array_elements(p_old->'chapters') loop
      select value into nc from pg_catalog.jsonb_array_elements(p->'chapters') where value->>'id'=oc->>'id';
      if nc is null then raise exception '已有章节不能删除，请保留历史学习结构。' using errcode='22023'; end if;
      for ok in select value from pg_catalog.jsonb_array_elements(oc->'packs') loop
        select value into nk from pg_catalog.jsonb_array_elements(nc->'packs') where value->>'id'=ok->>'id';
        if nk is null then raise exception '已有学习包不能删除或移动到其他章节。' using errcode='22023'; end if;
        for oq in select value from pg_catalog.jsonb_array_elements(ok->'questions') loop
          if not exists(select 1 from pg_catalog.jsonb_array_elements(nk->'questions') where value->>'id'=oq->>'id') then
            raise exception '已有习题不能删除，请保留历史答案。' using errcode='22023';
          end if;
        end loop;
      end loop;
    end loop;
  end if;
end;
$$;
revoke all on function study_private.valid_text(jsonb,integer,boolean),study_private.valid_id(jsonb),study_private.valid_timestamp(jsonb),study_private.valid_date(jsonb),study_private.validate_project(jsonb,jsonb) from public,anon,authenticated;

-- Writes are possible only through this checked transaction. Direct table writes have no grant.
create or replace function study_private.save_record(p_room_id uuid,p_kind text,p_id text,p_payload jsonb,p_expected_revision bigint)
returns public.study_records language plpgsql security definer set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_project public.study_records;
  v_old public.study_records;
  v_result public.study_records;
  v_pid text;
  v_payload jsonb := p_payload;
  v_active jsonb;
  v_former jsonb;
  v_revision bigint;
  v_minutes numeric;
  v_target text;
  v_has_old boolean;
  v_pack jsonb;
  v_chapter_id text;
  v_submission jsonb;
  v_segment jsonb;
  v_previous_end timestamptz;
begin
  if v_uid is null or p_room_id is distinct from study_private.my_room_id() then
    raise exception '你没有这个学习空间的访问权限。' using errcode='42501';
  end if;
  if p_kind not in ('project','progress','answer','session','review') or p_kind is null or
     not study_private.valid_id(pg_catalog.to_jsonb(p_id)) or
     pg_catalog.jsonb_typeof(p_payload) is distinct from 'object' or pg_catalog.octet_length(p_payload::text)>1048576 then
    raise exception '学习记录格式不正确。' using errcode='22023';
  end if;
  if p_expected_revision is null or p_expected_revision<0 then
    raise exception '请先同步最新记录后再保存。' using errcode='22023';
  end if;
  v_pid := case when p_kind='project' then p_id else p_payload->>'projectId' end;
  if coalesce(v_pid,'')='' then raise exception '请选择学习项目。' using errcode='22023'; end if;
  -- One lock per project serializes membership changes with personal writes and first project creation.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text || ':' || v_pid,812148));
  select * into v_project from public.study_records where room_id=p_room_id and kind='project' and id=v_pid for update;
  if p_kind<>'project' or v_project.id is not null then
    if v_project.id is null or not (v_project.payload->'memberIds' ? v_uid::text) then
      raise exception '你已不在这本书的学习小组中。' using errcode='42501';
    end if;
  end if;
  select * into v_old from public.study_records where room_id=p_room_id and kind=p_kind and id=p_id for update;
  v_has_old := found;
  if v_has_old and p_kind<>'project' and v_old.owner_id<>v_uid then
    raise exception '只能修改自己的学习记录。' using errcode='42501';
  end if;
  if (v_has_old and v_old.revision<>p_expected_revision) or (not v_has_old and p_expected_revision<>0) then
    raise exception 'STUDY_CONFLICT' using errcode='P0001',detail='记录已在另一处更新，请比较并合并后重新保存。';
  end if;
  v_revision := case when v_has_old then v_old.revision+1 else 1 end;
  v_payload := v_payload || pg_catalog.jsonb_build_object('id',p_id);
  if p_kind='project' then
    if (v_has_old and coalesce(p_payload->>'ownerId',v_old.owner_id::text)<>v_old.owner_id::text) or
       (not v_has_old and coalesce(p_payload->>'ownerId',v_uid::text)<>v_uid::text) then
      raise exception '项目负责人不能修改。' using errcode='42501';
    end if;
    v_active := p_payload->'memberIds';
    if pg_catalog.jsonb_typeof(v_active) is distinct from 'array' or pg_catalog.jsonb_array_length(v_active)=0 or
       not (v_active ? case when v_has_old then v_old.owner_id::text else v_uid::text end) then
      raise exception '学习小组必须包含项目负责人。' using errcode='22023';
    end if;
    if exists(select 1 from pg_catalog.jsonb_array_elements(v_active) member where pg_catalog.jsonb_typeof(member)<>'string') or
       (select count(*) from pg_catalog.jsonb_array_elements_text(v_active))<>(select count(distinct x) from pg_catalog.jsonb_array_elements_text(v_active) x) or
       exists(select 1 from pg_catalog.jsonb_array_elements_text(v_active) x where not exists(select 1 from public.study_members m where m.room_id=p_room_id and m.user_id::text=x)) then
      raise exception '请选择空间内已有的学习账号。' using errcode='22023';
    end if;
    if v_has_old and v_old.owner_id<>v_uid and not
       (v_active @> (v_old.payload->'memberIds') and (v_old.payload->'memberIds') @> v_active) then
      raise exception '只有项目负责人可以管理学习成员。' using errcode='42501';
    end if;
    if v_has_old and v_old.owner_id<>v_uid and v_payload->'chapters' is distinct from v_old.payload->'chapters' then
      raise exception '只有本书创建者可以管理学习包和题目。' using errcode='42501';
    end if;
    -- Tombstones are generated only by the deletion RPCs.
    if coalesce(v_payload->'deletedPackIds','[]'::jsonb) is distinct from coalesce(v_old.payload->'deletedPackIds','[]'::jsonb) or
       coalesce(v_payload->'deletedQuestionIds','{}'::jsonb) is distinct from coalesce(v_old.payload->'deletedQuestionIds','{}'::jsonb) then
      raise exception '请通过删除接口更新学习内容。' using errcode='22023';
    end if;
    -- The server derives inactive historical membership; clients cannot erase or fabricate it.
    select coalesce(pg_catalog.jsonb_agg(x order by x),'[]'::jsonb) into v_former from (
      select distinct x from pg_catalog.jsonb_array_elements_text(
        case when v_has_old then coalesce(v_old.payload->'formerMemberIds','[]'::jsonb) || coalesce(v_old.payload->'memberIds','[]'::jsonb) else '[]'::jsonb end
      ) x where not (v_active ? x)
    ) historical;
    perform study_private.validate_project(v_payload,case when v_has_old then v_old.payload else null end);
    v_payload := v_payload || pg_catalog.jsonb_build_object('ownerId',case when v_has_old then v_old.owner_id::text else v_uid::text end,
      'memberIds',v_active,'formerMemberIds',v_former,'revision',v_revision);
  else
    if left(p_id,37)<>v_uid::text || ':' then raise exception '记录归属不正确。' using errcode='42501'; end if;
    if v_has_old and v_old.project_id<>v_pid then raise exception '记录不能移到其他项目。' using errcode='42501'; end if;
    v_payload := v_payload || pg_catalog.jsonb_build_object('learnerId',v_uid::text);
    if not study_private.valid_id(v_payload->'projectId') or not study_private.valid_id(v_payload->'packId') then raise exception '请选择有效的学习包。' using errcode='22023'; end if;
    select pack,c->>'id' into v_pack,v_chapter_id
      from pg_catalog.jsonb_array_elements(v_project.payload->'chapters') c,
           pg_catalog.jsonb_array_elements(c->'packs') pack where pack->>'id'=v_payload->>'packId';
    if v_pack is null then raise exception '学习包已不存在，请同步后重试。' using errcode='22023'; end if;
    if p_kind<>'session' and not study_private.valid_timestamp(v_payload->'updatedAt') then raise exception '记录更新时间不正确。' using errcode='22023'; end if;
    if p_kind in ('progress','session','review') and not study_private.valid_text(v_payload->'note',100000) then raise exception '学习备注格式不正确。' using errcode='22023'; end if;
  end if;
  if p_kind='progress' then
    if p_id<>v_uid::text || ':' || v_pid || ':' || (v_payload->>'packId') or not study_private.valid_text(v_payload->'evidence',100000) then
      raise exception '学习记录编号或成果格式不正确。' using errcode='22023';
    end if;
    if coalesce(v_payload->>'status','') not in ('studying','submitted','revision') then
      raise exception '学习状态不正确。' using errcode='22023';
    end if;
    if v_has_old and v_old.payload ? 'completedAt' then v_payload := v_payload || pg_catalog.jsonb_build_object('completedAt',v_old.payload->'completedAt'); end if;
    if v_has_old and v_old.payload ? 'completedDate' then v_payload := v_payload || pg_catalog.jsonb_build_object('completedDate',v_old.payload->'completedDate'); end if;
    if (v_payload ? 'completedAt' or v_payload ? 'completedDate') and
       (not study_private.valid_timestamp(v_payload->'completedAt') or not study_private.valid_date(v_payload->'completedDate')) then
      raise exception '首次完成时间不正确。' using errcode='22023';
    end if;
  end if;
  if p_kind='answer' and (not study_private.valid_id(v_payload->'questionId') or not study_private.valid_text(v_payload->'text',100000) or
     p_id<>v_uid::text || ':' || v_pid || ':' || (v_payload->>'packId') || ':' || (v_payload->>'questionId') or
     not exists(select 1 from pg_catalog.jsonb_array_elements(v_pack->'questions') q where q->>'id'=v_payload->>'questionId')) then
    raise exception '习题答案格式不正确。' using errcode='22023';
  end if;
  if p_kind='session' then
    if v_chapter_id is distinct from v_payload->>'chapterId' or not study_private.valid_timestamp(v_payload->'createdAt') or
       (v_payload ? 'updatedAt' and not study_private.valid_timestamp(v_payload->'updatedAt')) or
       (v_payload ? 'voidedAt' and not study_private.valid_timestamp(v_payload->'voidedAt')) then
      raise exception '学习章节或记录时间不正确。' using errcode='22023';
    end if;
    if v_has_old then v_payload := v_payload || pg_catalog.jsonb_build_object('createdAt',v_old.payload->'createdAt'); end if;
    if (v_payload ? 'timeZone' and (not study_private.valid_text(v_payload->'timeZone',100,true) or not exists(select 1 from pg_catalog.pg_timezone_names where name=v_payload->>'timeZone'))) or
       (v_payload ? 'timerAdjusted' and pg_catalog.jsonb_typeof(v_payload->'timerAdjusted') is distinct from 'boolean') then
      raise exception '计时记录时区或调整标记不正确。' using errcode='22023';
    end if;
    if v_payload ? 'timerSegments' then
      if pg_catalog.jsonb_typeof(v_payload->'timerSegments') is distinct from 'array' then raise exception '计时片段格式不正确。' using errcode='22023'; end if;
      if pg_catalog.jsonb_array_length(v_payload->'timerSegments') not between 1 and 1000 then raise exception '计时片段数量不正确。' using errcode='22023'; end if;
      for v_segment in select value from pg_catalog.jsonb_array_elements(v_payload->'timerSegments') loop
        if not study_private.valid_timestamp(v_segment->'start') or not study_private.valid_timestamp(v_segment->'end') then
          raise exception '计时片段起止时间不正确。' using errcode='22023';
        end if;
        if (v_segment->>'end')::timestamptz<=(v_segment->>'start')::timestamptz or
           (v_previous_end is not null and (v_segment->>'start')::timestamptz<v_previous_end) then
          raise exception '计时片段必须按时间排列且不能重叠。' using errcode='22023';
        end if;
        v_previous_end := (v_segment->>'end')::timestamptz;
      end loop;
      -- Raw segments remain evidence after a manual date/minute adjustment, so sums/dates need not match.
    end if;
    if pg_catalog.jsonb_typeof(v_payload->'minutes') is distinct from 'number' then raise exception '学习时长必须是数字。' using errcode='22023'; end if;
    v_minutes := (v_payload->>'minutes')::numeric;
    if v_minutes<=0 or v_minutes>1500 then raise exception '单条时长应在 0–1500 分钟之间。' using errcode='22023'; end if;
    if coalesce(v_payload->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(v_payload->>'chapterId','')='' then
      raise exception '学习日期或章节不正确。' using errcode='22023';
    end if;
    perform (v_payload->>'date')::date;
    if v_payload ? 'voidedAt' then perform (v_payload->>'voidedAt')::timestamptz; end if;
  end if;
  if p_kind='review' then
    v_target := v_payload->>'targetLearnerId';
    if v_target is null or v_target=v_uid::text or not (v_project.payload->'memberIds' ? v_target) then
      raise exception '只能审核同一本书内其他在学成员的提交。' using errcode='42501';
    end if;
    if coalesce(v_payload->>'outcome','') not in ('passed','changes') or not study_private.valid_timestamp(v_payload->'submissionUpdatedAt') or
       p_id<>v_uid::text || ':' || v_pid || ':' || (v_payload->>'packId') || ':' || v_target then
      raise exception '审核结果或提交版本不正确。' using errcode='22023';
    end if;
    select payload into v_submission from public.study_records where room_id=p_room_id and kind='progress'
      and id=v_target || ':' || v_pid || ':' || (v_payload->>'packId');
    if v_submission is null or v_submission->>'status'<>'submitted' or
       v_submission->>'updatedAt' is distinct from v_payload->>'submissionUpdatedAt' then
      raise exception '这份提交已更新，请刷新后重新审核。' using errcode='22023';
    end if;
    if exists(select 1 from pg_catalog.jsonb_array_elements(v_pack->'questions') q where not exists(
      select 1 from public.study_records a where a.room_id=p_room_id and a.kind='answer'
        and a.id=v_target || ':' || v_pid || ':' || (v_payload->>'packId') || ':' || (q->>'id')
        and btrim(a.payload->>'text')<>'' and (a.payload->>'updatedAt')::timestamptz<=(v_submission->>'updatedAt')::timestamptz
    )) or (v_payload->>'outcome'='passed' and btrim(coalesce(v_submission->>'evidence',''))='') then
      raise exception '提交的答案或成果已变化，请伙伴重新提交后再审核。' using errcode='22023';
    end if;
  end if;
  insert into public.study_records(room_id,kind,id,owner_id,payload,project_id,revision,updated_at)
    values(p_room_id,p_kind,p_id,case when v_has_old then v_old.owner_id else v_uid end,v_payload,v_pid,v_revision,pg_catalog.clock_timestamp())
  on conflict(room_id,kind,id) do update set payload=excluded.payload,revision=excluded.revision,updated_at=excluded.updated_at
  returning * into v_result;
  return v_result;
end;
$$;
revoke all on function study_private.save_record(uuid,text,text,jsonb,bigint) from public,anon;
grant execute on function study_private.save_record(uuid,text,text,jsonb,bigint) to authenticated;
create or replace function public.study_save_record(p_room_id uuid,p_kind text,p_id text,p_payload jsonb,p_expected_revision bigint)
returns public.study_records language sql security invoker set search_path=''
as $$ select study_private.save_record(p_room_id,p_kind,p_id,p_payload,p_expected_revision); $$;
revoke all on function public.study_save_record(uuid,text,text,jsonb,bigint) from public,anon;
grant execute on function public.study_save_record(uuid,text,text,jsonb,bigint) to authenticated;

create or replace function public.study_my_room()
returns jsonb language sql stable security invoker set search_path=''
as $$
  select pg_catalog.jsonb_build_object('id',r.id,'name',r.name,'members',coalesce((
    select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',m.user_id,'name',m.display_name,
      'color',(array['#007aff','#9675ce','#2f9e86','#d98739','#d26684','#5873b8'])[1+mod(m.seat,6)]) order by m.seat)
    from public.study_members m where m.room_id=r.id),'[]'::jsonb))
  from public.study_rooms r where r.id=(select study_private.my_room_id());
$$;
revoke all on function public.study_my_room() from public,anon;
grant execute on function public.study_my_room() to authenticated;

-- Administrator-only provisioning. These functions are never exposed via the browser API.
create or replace function study_private.admin_add_member(p_room_id uuid,p_email text,p_display_name text)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_uid uuid; v_seat integer; v_existing uuid;
begin
  select id into v_uid from auth.users where lower(email)=lower(btrim(p_email));
  if v_uid is null then raise exception '先在 Authentication / Users 中创建这个账号。'; end if;
  if char_length(btrim(coalesce(p_display_name,''))) not between 1 and 40 then raise exception '昵称必须为 1–40 字。'; end if;
  perform 1 from public.study_rooms where id=p_room_id for update;
  if not found then raise exception '学习空间不存在。'; end if;
  select room_id into v_existing from public.study_members where user_id=v_uid;
  if v_existing is not null and v_existing<>p_room_id then raise exception '账号已属于另一个学习空间。'; end if;
  select coalesce(max(seat),-1)+1 into v_seat from public.study_members where room_id=p_room_id;
  insert into public.study_members(room_id,user_id,display_name,seat) values(p_room_id,v_uid,btrim(p_display_name),v_seat)
    on conflict(user_id) do update set display_name=excluded.display_name;
  return v_uid;
end;
$$;
create or replace function study_private.configure_workspace(p_name text,p_owner_email text,p_display_name text)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_uid uuid; v_room uuid;
begin
  select id into v_uid from auth.users where lower(email)=lower(btrim(p_owner_email));
  if v_uid is null then raise exception '先在 Authentication / Users 中创建负责人账号。'; end if;
  perform pg_catalog.pg_advisory_xact_lock(812149);
  select workspace_id into v_room from study_private.settings where singleton;
  if v_room is null then select room_id into v_room from public.study_members where user_id=v_uid; end if;
  if v_room is null then insert into public.study_rooms(name,created_by) values(btrim(p_name),v_uid) returning id into v_room; end if;
  perform study_private.admin_add_member(v_room,p_owner_email,p_display_name);
  insert into study_private.settings(singleton,workspace_id) values(true,v_room) on conflict(singleton) do update set workspace_id=excluded.workspace_id;
  return v_room;
end;
$$;
create or replace function study_private.add_provisioned_account()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_room uuid; v_seat integer; v_name text;
begin
  select workspace_id into v_room from study_private.settings where singleton;
  if v_room is null or new.email is null then return new; end if;
  perform 1 from public.study_rooms where id=v_room for update;
  select coalesce(max(seat),-1)+1 into v_seat from public.study_members where room_id=v_room;
  v_name := left(coalesce(nullif(new.raw_user_meta_data->>'display_name',''),nullif(split_part(new.email,'@',1),''),'学习伙伴'),40);
  insert into public.study_members(room_id,user_id,display_name,seat) values(v_room,new.id,v_name,v_seat) on conflict(user_id) do nothing;
  return new;
end;
$$;
revoke all on function study_private.admin_add_member(uuid,text,text),study_private.configure_workspace(text,text,text),study_private.add_provisioned_account() from public,anon,authenticated;
drop trigger if exists study_provisioned_account on auth.users;
create trigger study_provisioned_account after insert on auth.users for each row execute function study_private.add_provisioned_account();
notify pgrst,'reload schema';

-- Owner-only replacement/cleanup; project and dependent record removal commit together.
create or replace function public.study_replace_chapter_one(
  p_room_id uuid, p_project_id text, p_chapter jsonb, p_expected_revision bigint
) returns public.study_records
language plpgsql security definer set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_old public.study_records; v_result public.study_records;
  v_chapter jsonb; v_next_chapter jsonb; v_payload jsonb; v_comparison jsonb;
  v_removed text[]; v_new_count integer; v_revision bigint;
  v_new_ids text[] := array['ch1-01','ch1-02','ch1-03','ch1-04','ch1-05','ch1-R','ch1-P','ch1-P02','ch1-P03','ch1-P04','ch1-P05','ch1-P06','ch1-X01','ch1-X02','ch1-X03'];
  v_old_ids text[] := array['1-01','1-02','1-03','1-04','1-05','1-R','1-P'];
begin
  if v_uid is null or p_room_id is distinct from study_private.my_room_id() then
    raise exception '请登录对应的学习空间。' using errcode='42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text || ':' || p_project_id,812148));
  select * into v_old from public.study_records
    where room_id=p_room_id and kind='project' and id=p_project_id for update;
  if not found or v_old.owner_id<>v_uid or not (v_old.payload->'memberIds' ? v_uid::text) then
    raise exception '只有本书创建者可以删除旧学习包。' using errcode='42501';
  end if;
  if p_expected_revision is null or p_expected_revision<>v_old.revision then
    raise exception 'STUDY_CONFLICT' using errcode='P0001',detail='书籍已在另一处更新，请同步后重试。';
  end if;
  if v_old.payload->>'kind'<>'book' or not (p_project_id='computer-networking' or
    p_project_id ~* '^networking-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') then
    raise exception '此接口仅用于计算机网络第一章旧学习包。' using errcode='22023';
  end if;
  if p_chapter is null or pg_catalog.octet_length(p_chapter::text)>524288 or
    p_chapter->>'id' is distinct from '1' or pg_catalog.jsonb_typeof(p_chapter->'packs') is distinct from 'array' then
    raise exception '新版第一章内容不完整。' using errcode='22023';
  end if;
  if pg_catalog.jsonb_array_length(p_chapter->'packs')<>15 or
    exists(select 1 from pg_catalog.jsonb_array_elements(p_chapter->'packs') k where not (coalesce(k->>'id','')=any(v_new_ids))) then
    raise exception '新版第一章的学习包编号不正确。' using errcode='22023';
  end if;
  select c into v_chapter from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') c where c->>'id'='1';
  if v_chapter is null then raise exception '没有可更新的第一章。' using errcode='22023'; end if;
  select count(*) into v_new_count from pg_catalog.jsonb_array_elements(v_chapter->'packs') k where k->>'id'=any(v_new_ids);
  if v_new_count not in (0,15) then raise exception '第一章已存在部分新版编号，请先检查学习计划。' using errcode='22023'; end if;
  if v_new_count=0 and exists(select 1 from unnest(v_old_ids) x where not exists(
    select 1 from pg_catalog.jsonb_array_elements(v_chapter->'packs') k where k->>'id'=x
  )) then raise exception '未识别到完整旧版学习计划。' using errcode='22023'; end if;
  select coalesce(array_agg(k->>'id'),'{}'::text[]) into v_removed
    from pg_catalog.jsonb_array_elements(v_chapter->'packs') k
    where v_new_count=0 or k->>'id'=any(v_old_ids) or k->'archived'='true'::jsonb;
  if v_new_count=15 and exists(select 1 from unnest(v_new_ids) x where x=any(v_removed)) then
    raise exception '新版学习包不能由旧版清理接口删除。' using errcode='22023';
  end if;
  if cardinality(v_removed)=0 then return v_old; end if;
  if v_new_count=0 then
    v_next_chapter := pg_catalog.jsonb_set(v_chapter,'{packs}',p_chapter->'packs');
  else
    select pg_catalog.jsonb_set(v_chapter,'{packs}',coalesce(pg_catalog.jsonb_agg(k order by n),'[]'::jsonb)) into v_next_chapter
      from pg_catalog.jsonb_array_elements(v_chapter->'packs') with ordinality a(k,n) where not (k->>'id'=any(v_removed));
  end if;
  select pg_catalog.jsonb_set(v_old.payload,'{chapters}',pg_catalog.jsonb_agg(case when c->>'id'='1' then v_next_chapter else c end order by n)) into v_payload
    from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') with ordinality a(c,n);
  select v_payload || pg_catalog.jsonb_build_object('deletedPackIds',coalesce(pg_catalog.jsonb_agg(x order by x),'[]'::jsonb)) into v_payload from (
    select distinct x from pg_catalog.jsonb_array_elements_text(coalesce(v_old.payload->'deletedPackIds','[]'::jsonb) || pg_catalog.to_jsonb(v_removed)) x
  ) deleted;
  -- Normal curriculum validation still protects every unrelated chapter, pack and question.
  select pg_catalog.jsonb_set(v_old.payload,'{chapters}',pg_catalog.jsonb_agg(case when c->>'id'='1' then pg_catalog.jsonb_set(c,'{packs}',
    (select coalesce(pg_catalog.jsonb_agg(k order by kn),'[]'::jsonb) from pg_catalog.jsonb_array_elements(c->'packs') with ordinality ka(k,kn) where not (k->>'id'=any(v_removed)))) else c end order by n)) into v_comparison
    from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') with ordinality a(c,n);
  perform study_private.validate_project(v_payload,v_comparison);
  v_revision := v_old.revision+1;
  v_payload := v_payload || pg_catalog.jsonb_build_object('revision',v_revision);
  delete from public.study_records where room_id=p_room_id and project_id=p_project_id and kind<>'project' and payload->>'packId'=any(v_removed);
  update public.study_records set payload=v_payload, revision=v_revision, updated_at=pg_catalog.clock_timestamp()
    where room_id=p_room_id and kind='project' and id=p_project_id returning * into v_result;
  return v_result;
end;
$$;
revoke all on function public.study_replace_chapter_one(uuid,text,jsonb,bigint) from public,anon;
grant execute on function public.study_replace_chapter_one(uuid,text,jsonb,bigint) to authenticated;
notify pgrst, 'reload schema';

-- Delete one question and all of its answers atomically; other learning records remain.
create or replace function public.study_delete_question(p_room_id uuid,p_project_id text,p_pack_id text,p_question_id text,p_expected_revision bigint)
returns public.study_records language plpgsql security definer set search_path=''
as $$
declare
  v_uid uuid := auth.uid(); v_old public.study_records; v_result public.study_records;
  v_payload jsonb; v_chapters jsonb; v_deleted jsonb; v_pack jsonb;
begin
  if v_uid is null or p_room_id is distinct from study_private.my_room_id() then raise exception '无权访问该学习空间。' using errcode='42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text || ':' || p_project_id,812148));
  select * into v_old from public.study_records where room_id=p_room_id and kind='project' and id=p_project_id for update;
  if not found or v_old.owner_id<>v_uid or not (v_old.payload->'memberIds' ? v_uid::text) then raise exception '只有本书创建者可以管理题目。' using errcode='42501'; end if;
  if p_expected_revision is null or v_old.revision<>p_expected_revision then raise exception 'STUDY_CONFLICT' using errcode='P0001'; end if;
  select k.value into v_pack from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') c,
    lateral pg_catalog.jsonb_array_elements(c.value->'packs') k where k.value->>'id'=p_pack_id;
  if v_pack is null then raise exception '学习包不存在。' using errcode='22023'; end if;
  if not exists(select 1 from pg_catalog.jsonb_array_elements(v_pack->'questions') q where q->>'id'=p_question_id) then
    if coalesce(v_old.payload->'deletedQuestionIds'->p_pack_id,'[]'::jsonb) ? p_question_id then return v_old; end if;
    raise exception '题目不存在。' using errcode='22023';
  end if;
  select pg_catalog.jsonb_agg(pg_catalog.jsonb_set(c.value,'{packs}',(
    select pg_catalog.jsonb_agg(case when k.value->>'id'=p_pack_id then pg_catalog.jsonb_set(k.value,'{questions}',
      (select coalesce(pg_catalog.jsonb_agg(q.value order by q.ord),'[]'::jsonb) from pg_catalog.jsonb_array_elements(k.value->'questions') with ordinality q(value,ord) where q.value->>'id'<>p_question_id)) else k.value end order by k.ord)
    from pg_catalog.jsonb_array_elements(c.value->'packs') with ordinality k(value,ord))) order by c.ord)
    into v_chapters from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') with ordinality c(value,ord);
  v_deleted := coalesce(v_old.payload->'deletedQuestionIds','{}'::jsonb);
  v_deleted := pg_catalog.jsonb_set(v_deleted,array[p_pack_id],coalesce(v_deleted->p_pack_id,'[]'::jsonb)||pg_catalog.jsonb_build_array(p_question_id));
  v_payload := v_old.payload || pg_catalog.jsonb_build_object('chapters',v_chapters,'deletedQuestionIds',v_deleted,'revision',v_old.revision+1);
  perform study_private.validate_project(v_payload,pg_catalog.jsonb_set(v_old.payload,'{chapters}',v_chapters));
  delete from public.study_records where room_id=p_room_id and kind='answer' and payload->>'projectId'=p_project_id and payload->>'packId'=p_pack_id and payload->>'questionId'=p_question_id;
  update public.study_records set payload=v_payload,revision=v_old.revision+1,updated_at=pg_catalog.now()
    where room_id=p_room_id and kind='project' and id=p_project_id returning * into v_result;
  return v_result;
end;
$$;
revoke all on function public.study_delete_question(uuid,text,text,text,bigint) from public,anon;
grant execute on function public.study_delete_question(uuid,text,text,text,bigint) to authenticated;
notify pgrst,'reload schema';

commit;
