const eoa=document.querySelector('.eoa');
const flash = document.createElement('div');
const button =document.querySelector('.show')
flash.classList.add('flash');
// 获取所有的 cube 元素
let cubes;
class MultiArmedBandit{
    constructor(arms){
        this.arms=arms;
        this.probabilities = Array.from({length: arms}, () => getRandomArbitrary(0, 1, 2));
    }
    pull(arm){
        return Math.random()<this.probabilities[arm]?1:0;
    }
}
//初始化多臂赌博机,给出每个机器的获胜概率
const bandit=new MultiArmedBandit(10);
//设置模拟的步数
let num_steps=200;
//记录奖励和最优动作选择
const rewards=[];
const optimal_action_counts=[];
//动作价值估计和动作计数初始化
const estimates=new Array(bandit.arms).fill(0);
const action_counts=new Array(bandit.arms).fill(0);
//真正的最优动作(机器)
const optimal_action=bandit.probabilities.indexOf(Math.max(...bandit.probabilities));
console.log("最优动作的下标是:"+optimal_action+"最优机器是"+(optimal_action+1)+"号机");
const oa=document.querySelector('.oa');
oa.textContent=optimal_action+1;
// ε-贪婪策略的 ε探索 1-ε利用
let epsilon = 0.1;
//存储探索利用数组
//探索
const exploration=[];
//利用
const exploitation=[];
console.log(bandit.arms);
let step=0;
let action;
//统计图
const ctx=document.getElementById('myChart').getContext('2d');
let myChart;

function performStep(){
    if(step>=num_steps){
        updateEoaText();
        cubes[action].removeChild(flash);
        return;
    }
    let randomValue=Math.random();
    //小于epsilon探索，否则利用
    if(randomValue<epsilon){ 
        //下标从0开始，真实要+1
        action=Math.floor(Math.random()*bandit.arms);// 探索：随机选择一个动作(机器)
        cubes[action].appendChild(flash);
        exploration.push(action+1);
    }else{
        action = estimates.indexOf(Math.max(...estimates)); // 利用：选择当前估计的最佳动作(机器)
        exploitation.push(action+1);
        cubes[action].appendChild(flash);
    }
 // 获取奖励,调用pull方法 得到1或者0
 const reward = bandit.pull(action);
 // 更新记录，reward得到1或者0
 rewards.push(reward);
 //记分板，选择最优的情况下就赋值为1
 optimal_action_counts.push(action === optimal_action ? 1 : 0);
 // 更新动作计数(每个老虎机被选中的次数)和价值估计(逐步求的平均值)
 action_counts[action] += 1;
 estimates[action] += (reward - estimates[action]) / action_counts[action]; // 逐步平均
updateChartData();
step++;
setTimeout(performStep,120);
}

function updateEoaText() {
    //获取估计最优动作
eoa.textContent=estimates.indexOf(Math.max(...estimates))+1;
}
//更新图标
function updateChartData() {
function addData(chart, data, machineIdx) {
    chart.data.datasets[machineIdx].data.push(data);
    chart.update();
}
addData(myChart, estimates[action], action);
}

//创建或销毁图表
function createOrUpdateChart(num_steps){
    //图表存在，则销毁
    if(myChart){
        myChart.destroy();
    }
    const colors=['rgba(255,0,0)','rgba(27, 172, 70)','rgba(80, 32, 211)','rgba(255, 0, 170)','rgb(0, 255, 200)','rgb(140, 5, 167)','rgba(255, 255, 255)','rgba(139, 92, 92)','rgba(68, 140, 207)','rgba(98, 190, 118)']
    myChart=new Chart(ctx,{
        type:'line',
        data:{
            labels: Array.from({ length: num_steps }, (_, i) => i + 1),
            datasets:Array(bandit.arms).fill(null).map((_,idx)=>{
                return {
                    label:'赌博机 ' + (idx + 1),
                    data:[],
                    backgroundColor:colors[idx],
                    borderColor:colors[idx],
                    borderWidth:1
                };
            })
        },
        options:{
            scales:{
                y:{
                    beginAtZero:true,
                    ticks:{
                        color:'white'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.1)', // 改变y轴网格线颜色
                    },
                    title:{
                        display:true,
                        text:'Q值',
                        align:'end',
                        color:'white'
                    }
                },
                x:{
                    ticks:{
                        color:'white'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.1)', // 改变x轴网格线颜色
                    },
                    title:{
                        display:true,
                        text:'试验次数step',
                        align:'end',
                        color:'white'
                    }
                }
            },
            plugins:{
                legend:{
                    labels:{
                        color:'white'
                    }
                }
            }
        }}
);
}

document.addEventListener("DOMContentLoaded", function() {
    const probabilitiesElements = document.querySelectorAll('.probability');
    cubes = document.querySelectorAll('.cube'); // 确保这是全局变量或者对于本代码段是可见的

    bandit.probabilities.forEach((probability, index) => {
        probabilitiesElements[index].textContent = `获奖概率: ${probability}`;
    });
  createOrUpdateChart(num_steps);
});

function getRandomArbitrary(min, max, fixed) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(fixed));
}

button.addEventListener('click',function(){
  //开始模拟  
  performStep();
  createOrUpdateChart(num_steps); // 根据新的步数重新创建图表
});

let einput=document.getElementById('epsilonI');
einput.addEventListener('input',function(event){
    let value=parseFloat(event.target.value);
    if(isNaN(value)||value<0||value>1){
        alert("请输入0到1之间的数");
        event.target.value = ""; // 清空输入
    }
    else{
        epsilon=value;
    }
});

let sinput=document.getElementById('numstep');
sinput.addEventListener('input',function(event){
    let value=parseInt(event.target.value);
    if(isNaN(value)||value<1){
        alert("请输入大于等于1的整数");
        event.target.value = ""; // 清空输入
    }else{
        num_steps=value;
    }
})

// console.log("平均奖励：", rewards.reduce((a, b) => a + b, 0) / rewards.length);
// console.log("最优动作选择比例：", optimal_action_counts.reduce((a, b) => a + b, 0) / optimal_action_counts.length);
// console.log("动作价值估计：", estimates);
// console.log("最优动作：", (optimal_action+1), "，估计的最优动作：", estimates.indexOf(Math.max(...estimates)));