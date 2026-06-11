/**
 * 模板 01 参数模型
 */

// ==================== 默认值 ====================

export const defaults = {
  底板顶部标高: 71,
  垫层超出底面距离: 20,
  垫层厚度: 15,
  止水偏移表面: 20,
  闸室长: 1500,
  闸孔净宽: 400,
  闸底板厚: 100,
  边墩厚: 100,
  中墙厚: 100,
  闸墩高: 440,
  齿墙高: 50,
  齿墙宽: 50,
  闸门距上游: 800,
  闸门厚: 51,
  门槽入闸墩深: 30,
  门槽深: 30,
  门槽二期宽: 35,
  检修桥入闸墩深: 35,
  检修桥板厚: 35,
  检修桥板宽: 120,
  交通桥宽: 410,
  交通桥厚: 33,
  桥边距上游: 125,
  搭板长: 41,
  交通桥护边厚: 30,
  交通桥护边高: 30,
  上游渐变段中首断面距离: 600,
  上游渐变段中断面底宽: 360,
  上游渐变段中断面坡高: 440,
  上游渐变段中断面坡宽: 350,
  上游渐变段中断面趾高: 80,
  上游渐变段中断面趾宽: 80,
  上游渐变段中断面踵高: 50,
  上游渐变段中断面顶端高: 50,
  上游渐变段中断面顶端宽: 50,
  上游渐变段上断面铺盖宽: 60,
  上游渐变段上断面坡高: 400,
  上游渐变段上断面坡宽: 700,
  上游渐变段上断面底宽: 200,
  上游渐变段下断面底宽: 360,
  上游渐变段下断面坡高: 440,
  上游渐变段断面铺盖厚: 50,
  上游渐变段铺盖齿墙高: 50,
  上游渐变段铺盖齿墙宽: 50,
  上游连接段底板长度: 500,
  上游连接段底板厚度: 30,
  上游连接段底板齿墙高: 30,
  上游连接段底板齿墙宽: 30,
  上游连接段坡顶压坡宽: 30,
  上游连接段坡底槽宽: 30,
  上游连接段坡底槽高: 50,
  上游连接段坡底外槽宽: 30,
  上游连接段坡板厚度: 20,
  上游连接段坡齿厚度: 30,
  上游连接段坡齿宽度: 30,
  消力池陡坡段平直段长度: 50,
  消力池陡坡段长度: 216,
  消力池陡坡段高差: 50,
  消力池长度: 1034,
  消力池底板厚度: 70,
  消力池齿墙底宽: 50,
  消力池齿墙高度: 50,
  消力池陡坡段上部墙宽: 50,
  消力池陡坡段下部墙宽: 70,
  消力池墙高: 450,
  消力池斜墙段高度: 400,
  消力坎高: 50,
  消力坎顶宽: 50,
  下游渐变段中末断面距离: 600,
  下游渐变段中断面底宽: 360,
  下游渐变段中断面坡宽: 350,
  下游渐变段中断面趾高: 80,
  下游渐变段中断面趾宽: 80,
  下游渐变段中断面踵高: 50,
  下游渐变段中断面顶端高: 50,
  下游渐变段中断面顶端宽: 50,
  下游渐变段上断面底宽: 360,
  下游渐变段下断面铺盖宽: 60,
  下游渐变段下断面底宽: 200,
  下游渐变段下断面坡宽: 700,
  下游渐变段断面铺盖厚: 50,
  下游渐变段铺盖齿墙高: 50,
  下游渐变段铺盖齿墙宽: 50,
  下游连接段底板长度: 500,
  下游连接段底板厚度: 30,
  下游连接段底板齿墙高: 30,
  下游连接段底板齿墙宽: 30,
  下游连接段坡顶压坡宽: 30,
  下游连接段坡底槽宽: 30,
  下游连接段坡底槽高: 50,
  下游连接段坡底外槽宽: 30,
  下游连接段坡板厚度: 20,
  下游连接段坡齿厚度: 30,
  下游连接段坡齿宽度: 30,
}

// ==================== 字段分组 ====================

const rawGroups = [
  {
    id: 'gate',
    title: '闸室',
    subgroups: [
      { name: '闸室主体参数', endKey: '齿墙宽' },
      { name: '闸门参数', endKey: '门槽二期宽' },
      { name: '检修桥参数', endKey: '检修桥板宽' },
      { name: '交通桥参数', endKey: '交通桥护边高' },
      { name: '闸室计算参数', endKey: '闸总宽' },
    ],
    fields: [
      { key: '闸室长', label: '闸室长', unit: 'cm', part: 'gate', region: 'floor' },
      { key: '闸孔净宽', label: '闸孔净宽', unit: 'cm', part: 'gate', region: 'opening' },
      { key: '闸底板厚', label: '闸底板厚', unit: 'cm', part: 'gate', region: 'floor' },
      { key: '边墩厚', label: '边墩厚', unit: 'cm', part: 'gate', region: 'pier' },
      { key: '中墙厚', label: '中墙厚', unit: 'cm', part: 'gate', region: 'middlePier' },
      { key: '闸墩高', label: '闸墩高', unit: 'cm', part: 'gate', region: 'pier' },
      { key: '齿墙高', label: '齿墙高', unit: 'cm', part: 'gate', region: 'tooth' },
      { key: '齿墙宽', label: '齿墙宽', unit: 'cm', part: 'gate', region: 'tooth' },
      { key: '闸门距上游', label: '闸门距上游', unit: 'cm', part: 'gate', region: 'door' },
      { key: '闸门厚', label: '闸门厚', unit: 'cm', part: 'gate', region: 'door' },
      { key: '门槽入闸墩深', label: '门槽入闸墩深', unit: 'cm', part: 'gate', region: 'slot' },
      { key: '门槽深', label: '门槽深', unit: 'cm', part: 'gate', region: 'slot' },
      { key: '门槽二期宽', label: '门槽二期宽', unit: 'cm', part: 'gate', region: 'slot' },
      { key: '检修桥入闸墩深', label: '检修桥入闸墩深', unit: 'cm', part: 'gate', region: 'serviceBridge' },
      { key: '检修桥板厚', label: '检修桥板厚', unit: 'cm', part: 'gate', region: 'serviceBridge' },
      { key: '检修桥板宽', label: '检修桥板宽', unit: 'cm', part: 'gate', region: 'serviceBridge' },
      { key: '交通桥宽', label: '交通桥宽', unit: 'cm', part: 'gate', region: 'trafficBridge' },
      { key: '交通桥厚', label: '交通桥厚', unit: 'cm', part: 'gate', region: 'trafficBridge' },
      { key: '桥边距上游', label: '桥边距上游', unit: 'cm', part: 'gate', region: 'trafficBridge' },
      { key: '搭板长', label: '搭板长', unit: 'cm', part: 'gate', region: 'approachSlab' },
      { key: '交通桥护边厚', label: '交通桥护边厚', unit: 'cm', part: 'gate', region: 'trafficBridge' },
      { key: '交通桥护边高', label: '交通桥护边高', unit: 'cm', part: 'gate', region: 'trafficBridge' },
      { key: '闸孔数', label: '闸孔数', readonly: true },
      { key: '闸门宽', label: '闸门宽', unit: 'cm', readonly: true, decimals: 2 },
      { key: '闸总宽', label: '闸总宽', unit: 'cm', readonly: true, decimals: 2 },
    ],
  },
  {
    id: 'stilling',
    title: '消力池',
    subgroups: [
      { name: '消力池主体参数', endKey: '消力池齿墙高度' },
      { name: '消力池陡坡墙宽参数', endKey: '消力池陡坡段下部墙宽' },
      { name: '消力池墙体参数', endKey: '消力池斜墙段高度' },
      { name: '消力坎参数', endKey: '消力坎顶宽' },
      { name: '消力池计算参数', endKey: '消力池底板宽度' },
    ],
    fields: [
      { key: '消力池陡坡段平直段长度', label: '陡坡段平直段长度', unit: 'cm', part: 'stilling', region: 'slope' },
      { key: '消力池陡坡段长度', label: '陡坡段长度', unit: 'cm', part: 'stilling', region: 'slope' },
      { key: '消力池陡坡段高差', label: '陡坡段高差', unit: 'cm', part: 'stilling', region: 'slope' },
      { key: '消力池长度', label: '消力池长度', unit: 'cm', part: 'stilling', region: 'pool' },
      { key: '消力池底板厚度', label: '底板厚度', unit: 'cm', part: 'stilling', region: 'floor' },
      { key: '消力池齿墙底宽', label: '齿墙底宽', unit: 'cm', part: 'stilling', region: 'tooth' },
      { key: '消力池齿墙高度', label: '齿墙高度', unit: 'cm', part: 'stilling', region: 'tooth' },
      { key: '消力池陡坡段上部墙宽', label: '陡坡段上部墙宽', unit: 'cm', part: 'stilling', region: 'wall' },
      { key: '消力池陡坡段下部墙宽', label: '陡坡段下部墙宽', unit: 'cm', part: 'stilling', region: 'wall' },
      { key: '消力池墙高', label: '消力池墙高', unit: 'cm', part: 'stilling', region: 'wall' },
      { key: '消力池斜墙段高度', label: '斜墙段高度', unit: 'cm', part: 'stilling', region: 'wall' },
      { key: '消力坎高', label: '消力坎高', unit: 'cm', part: 'stilling', region: 'baffle' },
      { key: '消力坎顶宽', label: '消力坎顶宽', unit: 'cm', part: 'stilling', region: 'baffle' },
      { key: '消力池陡坡段墙高', label: '陡坡段墙高', unit: 'cm', readonly: true },
      { key: '消力池底板宽度', label: '底板宽度', unit: 'cm', readonly: true, decimals: 2 },
    ],
  },
  {
    id: 'upstreamConnection',
    title: '上游连接',
    subgroups: [
      { name: '上游连接底板参数', endKey: '上游连接段底板齿墙宽' },
      { name: '上游连接坡面构造参数', endKey: '上游连接段坡底外槽宽' },
      { name: '上游连接计算参数', endKey: '上游连接段渠底板宽' },
      { name: '上游连接坡板与坡齿参数', endKey: '上游连接段坡齿宽度' },
    ],
    fields: [
      { key: '上游连接段底板长度', label: '底板长度', unit: 'cm', part: 'upstreamConnection', region: 'floor' },
      { key: '上游连接段底板厚度', label: '底板厚度', unit: 'cm', part: 'upstreamConnection', region: 'floor' },
      { key: '上游连接段底板齿墙高', label: '底板齿墙高', unit: 'cm', part: 'upstreamConnection', region: 'tooth' },
      { key: '上游连接段底板齿墙宽', label: '底板齿墙宽', unit: 'cm', part: 'upstreamConnection', region: 'tooth' },
      { key: '上游连接段坡顶压坡宽', label: '坡顶压坡宽', unit: 'cm', part: 'upstreamConnection', region: 'slope' },
      { key: '上游连接段坡底槽宽', label: '坡底槽宽', unit: 'cm', part: 'upstreamConnection', region: 'ditch' },
      { key: '上游连接段坡底槽高', label: '坡底槽高', unit: 'cm', part: 'upstreamConnection', region: 'ditch' },
      { key: '上游连接段坡底外槽宽', label: '坡底外槽宽', unit: 'cm', part: 'upstreamConnection', region: 'ditch' },
      { key: '上游连接段坡面高度', label: '坡面高度', unit: 'cm', readonly: true },
      { key: '上游连接段坡面宽度', label: '坡面宽度', unit: 'cm', readonly: true },
      { key: '上游连接段渠底板宽', label: '渠底板宽', unit: 'cm', readonly: true, decimals: 2 },
      { key: '上游连接段坡板厚度', label: '坡板厚度', unit: 'cm', part: 'upstreamConnection', region: 'slope' },
      { key: '上游连接段坡齿厚度', label: '坡齿厚度', unit: 'cm', part: 'upstreamConnection', region: 'slope' },
      { key: '上游连接段坡齿宽度', label: '坡齿宽度', unit: 'cm', part: 'upstreamConnection', region: 'slope' },
    ],
  },
  {
    id: 'upstreamTransition',
    title: '上游渐变',
    subgroups: [
      { name: '上游渐变中断面参数', endKey: '上游渐变段中断面顶端宽' },
      { name: '上游渐变上断面参数', endKey: '上游渐变段上断面底宽' },
      { name: '上游渐变下断面参数', endKey: '上游渐变段下断面坡高' },
      { name: '上游渐变铺盖参数', endKey: '上游渐变段铺盖齿墙宽' },
      { name: '上游渐变计算参数', endKey: '上游渐变段中断面铺盖宽' },
    ],
    fields: [
      { key: '上游渐变段中首断面距离', label: '中首断面距离', unit: 'cm', part: 'upstreamTransition', region: 'length' },
      { key: '上游渐变段中断面底宽', label: '中断面底宽', unit: 'cm', part: 'upstreamTransition', region: 'middle' },
      { key: '上游渐变段中断面坡高', label: '中断面坡高', unit: 'cm', part: 'upstreamTransition', region: 'middle' },
      { key: '上游渐变段中断面坡宽', label: '中断面坡宽', unit: 'cm', part: 'upstreamTransition', region: 'middle' },
      { key: '上游渐变段中断面趾高', label: '中断面趾高', unit: 'cm', part: 'upstreamTransition', region: 'toe' },
      { key: '上游渐变段中断面趾宽', label: '中断面趾宽', unit: 'cm', part: 'upstreamTransition', region: 'toe' },
      { key: '上游渐变段中断面踵高', label: '中断面踵高', unit: 'cm', part: 'upstreamTransition', region: 'heel' },
      { key: '上游渐变段中断面顶端高', label: '中断面顶端高', unit: 'cm', part: 'upstreamTransition', region: 'wallTop' },
      { key: '上游渐变段中断面顶端宽', label: '中断面顶端宽', unit: 'cm', part: 'upstreamTransition', region: 'wallTop' },
      { key: '上游渐变段上断面铺盖宽', label: '上断面铺盖宽', unit: 'cm', part: 'upstreamTransition', region: 'upper' },
      { key: '上游渐变段上断面坡高', label: '上断面坡高', unit: 'cm', part: 'upstreamTransition', region: 'upper' },
      { key: '上游渐变段上断面坡宽', label: '上断面坡宽', unit: 'cm', part: 'upstreamTransition', region: 'upper' },
      { key: '上游渐变段上断面底宽', label: '上断面底宽', unit: 'cm', part: 'upstreamTransition', region: 'upper' },
      { key: '上游渐变段下断面底宽', label: '下断面底宽', unit: 'cm', part: 'upstreamTransition', region: 'lower' },
      { key: '上游渐变段下断面坡高', label: '下断面坡高', unit: 'cm', part: 'upstreamTransition', region: 'lower' },
      { key: '上游渐变段断面铺盖厚', label: '断面铺盖厚', unit: 'cm', part: 'upstreamTransition', region: 'floor' },
      { key: '上游渐变段铺盖齿墙高', label: '铺盖齿墙高', unit: 'cm', part: 'upstreamTransition', region: 'tooth' },
      { key: '上游渐变段铺盖齿墙宽', label: '铺盖齿墙宽', unit: 'cm', part: 'upstreamTransition', region: 'tooth' },
      { key: '上游渐变段上断面趾高', label: '上断面趾高', unit: 'cm', readonly: true },
      { key: '上游渐变段上断面趾宽', label: '上断面趾宽', unit: 'cm', readonly: true },
      { key: '上游渐变段上断面踵高', label: '上断面踵高', unit: 'cm', readonly: true },
      { key: '上游渐变段上断面顶端高', label: '上断面顶端高', unit: 'cm', readonly: true },
      { key: '上游渐变段上断面顶端宽', label: '上断面顶端宽', unit: 'cm', readonly: true },
      { key: '上游渐变段下断面趾高', label: '下断面趾高', unit: 'cm', readonly: true },
      { key: '上游渐变段下断面趾宽', label: '下断面趾宽', unit: 'cm', readonly: true },
      { key: '上游渐变段下断面踵高', label: '下断面踵高', unit: 'cm', readonly: true },
      { key: '上游渐变段下断面顶端宽', label: '下断面顶端宽', unit: 'cm', readonly: true },
      { key: '上游渐变段下断面顶端高', label: '下断面顶端高', unit: 'cm', readonly: true },
      { key: '上游渐变段中末断面距离', label: '中末断面距离', unit: 'cm', readonly: true },
      { key: '上游渐变段下断面铺盖宽', label: '下断面铺盖宽', unit: 'cm', readonly: true, decimals: 2 },
      { key: '上游渐变段中断面铺盖宽', label: '中断面铺盖宽', unit: 'cm', readonly: true, decimals: 2 },
    ],
  },
  {
    id: 'downstreamConnection',
    title: '下游连接',
    subgroups: [
      { name: '下游连接底板参数', endKey: '下游连接段底板齿墙宽' },
      { name: '下游连接坡面构造参数', endKey: '下游连接段坡底外槽宽' },
      { name: '下游连接计算参数', endKey: '下游连接段渠底板宽' },
      { name: '下游连接坡板与坡齿参数', endKey: '下游连接段坡齿宽度' },
    ],
    fields: [
      { key: '下游连接段底板长度', label: '底板长度', unit: 'cm', part: 'downstreamConnection', region: 'floor' },
      { key: '下游连接段底板厚度', label: '底板厚度', unit: 'cm', part: 'downstreamConnection', region: 'floor' },
      { key: '下游连接段底板齿墙高', label: '底板齿墙高', unit: 'cm', part: 'downstreamConnection', region: 'tooth' },
      { key: '下游连接段底板齿墙宽', label: '底板齿墙宽', unit: 'cm', part: 'downstreamConnection', region: 'tooth' },
      { key: '下游连接段坡顶压坡宽', label: '坡顶压坡宽', unit: 'cm', part: 'downstreamConnection', region: 'slope' },
      { key: '下游连接段坡底槽宽', label: '坡底槽宽', unit: 'cm', part: 'downstreamConnection', region: 'ditch' },
      { key: '下游连接段坡底槽高', label: '坡底槽高', unit: 'cm', part: 'downstreamConnection', region: 'ditch' },
      { key: '下游连接段坡底外槽宽', label: '坡底外槽宽', unit: 'cm', part: 'downstreamConnection', region: 'ditch' },
      { key: '下游连接段坡面高度', label: '坡面高度', unit: 'cm', readonly: true },
      { key: '下游连接段坡面宽度', label: '坡面宽度', unit: 'cm', readonly: true },
      { key: '下游连接段渠底板宽', label: '渠底板宽', unit: 'cm', readonly: true, decimals: 2 },
      { key: '下游连接段坡板厚度', label: '坡板厚度', unit: 'cm', part: 'downstreamConnection', region: 'slope' },
      { key: '下游连接段坡齿厚度', label: '坡齿厚度', unit: 'cm', part: 'downstreamConnection', region: 'slope' },
      { key: '下游连接段坡齿宽度', label: '坡齿宽度', unit: 'cm', part: 'downstreamConnection', region: 'slope' },
    ],
  },
  {
    id: 'downstreamTransition',
    title: '下游渐变',
    subgroups: [
      { name: '下游渐变中断面参数', endKey: '下游渐变段中断面顶端宽' },
      { name: '下游渐变上断面参数', endKey: '下游渐变段上断面底宽' },
      { name: '下游渐变下断面参数', endKey: '下游渐变段下断面坡宽' },
      { name: '下游渐变铺盖参数', endKey: '下游渐变段铺盖齿墙宽' },
      { name: '下游渐变计算参数', endKey: '下游渐变段中断面铺盖宽' },
    ],
    fields: [
      { key: '下游渐变段中末断面距离', label: '中末断面距离', unit: 'cm', part: 'downstreamTransition', region: 'length' },
      { key: '下游渐变段中断面底宽', label: '中断面底宽', unit: 'cm', part: 'downstreamTransition', region: 'middle' },
      { key: '下游渐变段中断面坡宽', label: '中断面坡宽', unit: 'cm', part: 'downstreamTransition', region: 'middle' },
      { key: '下游渐变段中断面趾高', label: '中断面趾高', unit: 'cm', part: 'downstreamTransition', region: 'toe' },
      { key: '下游渐变段中断面趾宽', label: '中断面趾宽', unit: 'cm', part: 'downstreamTransition', region: 'toe' },
      { key: '下游渐变段中断面踵高', label: '中断面踵高', unit: 'cm', part: 'downstreamTransition', region: 'heel' },
      { key: '下游渐变段中断面顶端高', label: '中断面顶端高', unit: 'cm', part: 'downstreamTransition', region: 'wallTop' },
      { key: '下游渐变段中断面顶端宽', label: '中断面顶端宽', unit: 'cm', part: 'downstreamTransition', region: 'wallTop' },
      { key: '下游渐变段上断面底宽', label: '上断面底宽', unit: 'cm', part: 'downstreamTransition', region: 'upper' },
      { key: '下游渐变段下断面铺盖宽', label: '下断面铺盖宽', unit: 'cm', part: 'downstreamTransition', region: 'lower' },
      { key: '下游渐变段下断面底宽', label: '下断面底宽', unit: 'cm', part: 'downstreamTransition', region: 'lower' },
      { key: '下游渐变段下断面坡宽', label: '下断面坡宽', unit: 'cm', part: 'downstreamTransition', region: 'lower' },
      { key: '下游渐变段断面铺盖厚', label: '断面铺盖厚', unit: 'cm', part: 'downstreamTransition', region: 'floor' },
      { key: '下游渐变段铺盖齿墙高', label: '铺盖齿墙高', unit: 'cm', part: 'downstreamTransition', region: 'tooth' },
      { key: '下游渐变段铺盖齿墙宽', label: '铺盖齿墙宽', unit: 'cm', part: 'downstreamTransition', region: 'tooth' },
      { key: '下游渐变段中断面坡高', label: '中断面坡高', unit: 'cm', readonly: true },
      { key: '下游渐变段上断面铺盖宽', label: '上断面铺盖宽', unit: 'cm', readonly: true, decimals: 2 },
      { key: '下游渐变段上断面坡高', label: '上断面坡高', unit: 'cm', readonly: true },
      { key: '下游渐变段上断面趾高', label: '上断面趾高', unit: 'cm', readonly: true },
      { key: '下游渐变段上断面趾宽', label: '上断面趾宽', unit: 'cm', readonly: true },
      { key: '下游渐变段上断面踵高', label: '上断面踵高', unit: 'cm', readonly: true },
      { key: '下游渐变段上断面顶端高', label: '上断面顶端高', unit: 'cm', readonly: true },
      { key: '下游渐变段上断面顶端宽', label: '上断面顶端宽', unit: 'cm', readonly: true },
      { key: '下游渐变段下断面坡高', label: '下断面坡高', unit: 'cm', readonly: true },
      { key: '下游渐变段下断面趾高', label: '下断面趾高', unit: 'cm', readonly: true },
      { key: '下游渐变段下断面趾宽', label: '下断面趾宽', unit: 'cm', readonly: true },
      { key: '下游渐变段下断面踵高', label: '下断面踵高', unit: 'cm', readonly: true },
      { key: '下游渐变段下断面顶端宽', label: '下断面顶端宽', unit: 'cm', readonly: true },
      { key: '下游渐变段下断面顶端高', label: '下断面顶端高', unit: 'cm', readonly: true },
      { key: '下游渐变段中首断面距离', label: '中首断面距离', unit: 'cm', readonly: true },
      { key: '下游渐变段中断面铺盖宽', label: '中断面铺盖宽', unit: 'cm', readonly: true, decimals: 2 },
    ],
  },
]

// 为字段补充分组和高亮元数据   保持 groups.fields 对外仍为扁平数组
export const groups = rawGroups.map(({ subgroups, ...group }) => {
  let subgroupIndex = 0

  return {
    ...group,
    fields: group.fields.map((field) => {
      const subgroup = subgroups[subgroupIndex]
      const result = {
        ...field,
        subgroup: subgroup.name,
        guideRegion: (field.unit === 'cm' && field.part) ? `${field.part}.${field.key}` : undefined,
      }

      if (field.key === subgroup.endKey) {
        subgroupIndex += 1
      }

      return result
    }),
  }
})

// ==================== 派生计算 ====================

export function computeDerived(params, project) {
  const 闸孔数 = 1
  const 闸门宽 = params.闸孔净宽 + 2 * params.门槽入闸墩深
  const 闸总宽 = params.闸孔净宽 + 2 * params.边墩厚
  const 上游渐变段中末断面距离 = params.上游渐变段中首断面距离
  const 上游渐变段下断面铺盖宽 =
    闸总宽 - 2 * params.边墩厚 - 2 * params.上游渐变段中断面趾宽
  const 上游渐变段中断面铺盖宽 =
    (params.上游渐变段上断面铺盖宽 + 上游渐变段下断面铺盖宽) / 2
  const 上游连接段坡面高度 = params.上游渐变段上断面坡高
  const 上游连接段坡面宽度 = params.上游渐变段上断面坡宽
  const 上游连接段渠底板宽 =
    params.上游渐变段上断面铺盖宽 + 2 * params.上游渐变段中断面趾宽
  const 消力池陡坡段墙高 = params.闸墩高
  const 消力池底板宽度 = 闸总宽 - 2 * params.边墩厚
  const 下游渐变段中断面坡高 = params.消力池斜墙段高度
  const 下游渐变段上断面铺盖宽 =
    消力池底板宽度 - 2 * params.下游渐变段中断面趾宽
  const 下游渐变段上断面坡高 = 下游渐变段中断面坡高
  const 下游渐变段中首断面距离 = 上游渐变段中末断面距离
  const 下游渐变段中断面铺盖宽 =
    (下游渐变段上断面铺盖宽 + params.下游渐变段下断面铺盖宽) / 2
  const 下游连接段坡面高度 = 下游渐变段中断面坡高
  const 下游连接段坡面宽度 = params.下游渐变段下断面坡宽
  const 下游连接段渠底板宽 =
    params.下游渐变段下断面铺盖宽 + 2 * params.下游渐变段中断面趾宽
  const 上游渐变段上断面趾高 = params.上游渐变段中断面趾高
  const 上游渐变段上断面趾宽 = params.上游渐变段中断面趾宽
  const 上游渐变段上断面踵高 = params.上游渐变段中断面踵高
  const 上游渐变段上断面顶端高 = params.上游渐变段中断面顶端高
  const 上游渐变段上断面顶端宽 = params.上游渐变段中断面顶端宽
  const 上游渐变段下断面趾高 = params.上游渐变段中断面趾高
  const 上游渐变段下断面趾宽 = params.上游渐变段中断面趾宽
  const 上游渐变段下断面踵高 = params.上游渐变段中断面踵高
  const 上游渐变段下断面顶端宽 = params.上游渐变段中断面顶端宽
  const 上游渐变段下断面顶端高 = params.上游渐变段中断面顶端高
  const 下游渐变段上断面趾高 = params.下游渐变段中断面趾高
  const 下游渐变段上断面趾宽 = params.下游渐变段中断面趾宽
  const 下游渐变段上断面踵高 = params.下游渐变段中断面踵高
  const 下游渐变段上断面顶端高 = params.下游渐变段中断面顶端高
  const 下游渐变段上断面顶端宽 = params.下游渐变段中断面顶端宽
  const 下游渐变段下断面坡高 = 下游渐变段中断面坡高
  const 下游渐变段下断面趾高 = params.下游渐变段中断面趾高
  const 下游渐变段下断面趾宽 = params.下游渐变段中断面趾宽
  const 下游渐变段下断面踵高 = params.下游渐变段中断面踵高
  const 下游渐变段下断面顶端宽 = params.下游渐变段中断面顶端宽
  const 下游渐变段下断面顶端高 = params.下游渐变段中断面顶端高
  const 底板高程 = params.底板顶部标高.toFixed(2)
  const 闸顶高程 = (params.底板顶部标高 + params.闸墩高 / 100).toFixed(2)
  const 上游墙顶高程 = (params.底板顶部标高 + 上游连接段坡面高度 / 100).toFixed(2)
  const 消力池底板高程 = (params.底板顶部标高 - params.消力池陡坡段高差 / 100).toFixed(2)
  const 下游底板高程 = (
    params.底板顶部标高 -
    params.消力池陡坡段高差 / 100 +
    params.消力坎高 / 100
  ).toFixed(2)
  const 下游墙顶高程 = (
    params.底板顶部标高 -
    params.消力池陡坡段高差 / 100 +
    params.消力坎高 / 100 +
    下游渐变段上断面坡高 / 100
  ).toFixed(2)
  const 渠坡比 = `1:${round1(上游连接段坡面宽度 / 上游连接段坡面高度)}`
  const 陡坡比 = `1:${round1(params.消力池陡坡段长度 / params.消力池陡坡段高差)}`
  const 坡比值 = round1(上游连接段坡面宽度 / 上游连接段坡面高度)
  const 陡坡比值 = round1(params.消力池陡坡段长度 / params.消力池陡坡段高差)
  const 上游连接段底板 = `${params.上游连接段底板厚度 * 10}mm厚${project.主材类型}`
  const 上游渐变段底板 = `${params.上游渐变段断面铺盖厚 * 10}mm厚${project.主材类型}`
  const 闸室底板 = `${params.闸底板厚 * 10}mm厚${project.主材类型}`
  const 消力池底板 = `${params.消力池底板厚度 * 10}mm厚${project.主材类型}`
  const 下游渐变段底板 = `${params.下游渐变段断面铺盖厚 * 10}mm厚${project.主材类型}`
  const 下游连接段底板 = `${params.下游连接段底板厚度 * 10}mm厚${project.主材类型}`
  const C15垫层砼 = `${params.垫层厚度 * 10}mm厚${project.垫层类型1}`

  const allParameters = {
    ...params,
     ...project,
     闸孔数,
     闸门宽,
    闸总宽,
    上游渐变段中末断面距离,
    上游渐变段下断面铺盖宽,
    上游渐变段中断面铺盖宽,
     上游渐变段上断面趾高,
     上游渐变段上断面趾宽,
     上游渐变段上断面踵高,
     上游渐变段上断面顶端高,
     上游渐变段上断面顶端宽,
     上游渐变段下断面趾高,
     上游渐变段下断面趾宽,
     上游渐变段下断面踵高,
     上游渐变段下断面顶端宽,
     上游渐变段下断面顶端高,
     上游连接段坡面高度,
    上游连接段坡面宽度,
    上游连接段渠底板宽,
    消力池陡坡段墙高,
    消力池底板宽度,
    下游渐变段中断面坡高,
    下游渐变段上断面铺盖宽,
    下游渐变段上断面坡高,
     下游渐变段上断面趾高,
     下游渐变段上断面趾宽,
     下游渐变段上断面踵高,
     下游渐变段上断面顶端高,
     下游渐变段上断面顶端宽,
     下游渐变段下断面坡高,
     下游渐变段下断面趾高,
     下游渐变段下断面趾宽,
     下游渐变段下断面踵高,
     下游渐变段下断面顶端宽,
     下游渐变段下断面顶端高,
     下游渐变段中首断面距离,
    下游渐变段中断面铺盖宽,
    下游连接段坡面高度,
    下游连接段坡面宽度,
    下游连接段渠底板宽,
    底板高程,
    闸顶高程,
    上游墙顶高程,
    消力池底板高程,
    下游底板高程,
    下游墙顶高程,
    渠坡比,
    陡坡比,
    坡比值,
    陡坡比值,
    上游连接段底板,
    上游渐变段底板,
    闸室底板,
    消力池底板,
    下游渐变段底板,
    下游连接段底板,
    C15垫层砼,
  }

  return {
    闸孔数,
    闸门宽,
    闸总宽,
    上游渐变段中末断面距离,
    上游渐变段下断面铺盖宽,
    上游渐变段中断面铺盖宽,
    上游渐变段上断面趾高,
    上游渐变段上断面趾宽,
    上游渐变段上断面踵高,
    上游渐变段上断面顶端高,
    上游渐变段上断面顶端宽,
    上游渐变段下断面趾高,
    上游渐变段下断面趾宽,
    上游渐变段下断面踵高,
    上游渐变段下断面顶端宽,
    上游渐变段下断面顶端高,
    上游连接段坡面高度,
    上游连接段坡面宽度,
    上游连接段渠底板宽,
    消力池陡坡段墙高,
    消力池底板宽度,
    下游渐变段中断面坡高,
    下游渐变段上断面铺盖宽,
    下游渐变段上断面坡高,
    下游渐变段上断面趾高,
    下游渐变段上断面趾宽,
    下游渐变段上断面踵高,
    下游渐变段上断面顶端高,
    下游渐变段上断面顶端宽,
    下游渐变段下断面坡高,
    下游渐变段下断面趾高,
    下游渐变段下断面趾宽,
    下游渐变段下断面踵高,
    下游渐变段下断面顶端宽,
    下游渐变段下断面顶端高,
    下游渐变段中首断面距离,
    下游渐变段中断面铺盖宽,
    下游连接段坡面高度,
    下游连接段坡面宽度,
    下游连接段渠底板宽,
    底板高程,
    闸顶高程,
    上游墙顶高程,
    消力池底板高程,
    下游底板高程,
    下游墙顶高程,
    渠坡比,
    陡坡比,
    坡比值,
    陡坡比值,
    上游连接段底板,
    上游渐变段底板,
    闸室底板,
    消力池底板,
    下游渐变段底板,
    下游连接段底板,
    C15垫层砼,
    allParameters,
  }
}

// ==================== 校验 ====================

export function validate(params, derived) {
  const errors = []

  for (const [key, value] of Object.entries(params)) {
    if (!Number.isFinite(value)) {
      errors.push(`${key} 必须是有效数字`)
    } else if (value <= 0) {
      errors.push(`${key} 必须大于 0`)
    }
  }

  if (params.闸门距上游 + params.闸门厚 >= params.闸室长) {
    errors.push('闸门距上游与闸门厚之和必须小于闸室长')
  }

  if (params.桥边距上游 + params.交通桥宽 >= params.闸室长) {
    errors.push('桥边距上游与交通桥宽之和必须小于闸室长')
  }

  if (derived.上游渐变段下断面铺盖宽 <= 0) {
    errors.push('上游渐变段下断面铺盖宽推导值必须大于 0')
  }

  if (derived.下游渐变段上断面铺盖宽 <= 0) {
    errors.push('下游渐变段上断面铺盖宽推导值必须大于 0')
  }

  if (params.消力池陡坡段高差 === 0) {
    errors.push('消力池陡坡段高差不能为 0')
  }

  if (derived.上游连接段坡面高度 !== params.上游渐变段上断面坡高) {
    errors.push('上游连接段坡面高度必须等于上游渐变段上断面坡高')
  }

  if (derived.下游连接段坡面宽度 !== params.下游渐变段下断面坡宽) {
    errors.push('下游连接段坡面宽度必须等于下游渐变段下断面坡宽')
  }

  return errors
}


function round1(value) {
  return Math.round(value * 10) / 10
}
