/**
 * 饮食规划模块 - 高蛋白增肌计划
 */

class NutritionPlanner {
  constructor(config = {}) {
    this.config = {
      focus: config.focus || 'high-protein',
      goal: config.goal || 'muscle-gain',
      proteinPerKg: config.proteinPerKg || 2.0,
      caloriesMultiplier: config.caloriesMultiplier || 35,
      ...config
    };
  }

  /**
   * 生成高蛋白饮食计划
   */
  generatePlan(weight = 75) {
    const { proteinPerKg, caloriesMultiplier } = this.config;
    const calories = Math.round(weight * caloriesMultiplier);
    const protein = Math.round(weight * proteinPerKg);
    const carbs = Math.round(calories * 0.45 / 4);
    const fat = Math.round(calories * 0.25 / 9);

    return {
      type: '高蛋白增肌计划',
      targetWeight: weight,
      daily: {
        calories,
        protein,
        carbs,
        fat,
        water: '3-4 升'
      },
      meals: {
        breakfast: {
          name: '高蛋白早餐',
          time: '07:30',
          items: [
            { name: '燕麦', amount: '50g', protein: '6g' },
            { name: '蛋白', amount: '4 个 + 全蛋 2 个', protein: '26g' },
            { name: '牛奶', amount: '250ml', protein: '8g' },
            { name: '香蕉', amount: '1 根', protein: '1g' }
          ],
          totalProtein: '41g',
          tips: '早餐是一天最重要的一餐，保证充足蛋白质'
        },
        lunch: {
          name: '均衡午餐',
          time: '12:30',
          items: [
            { name: '鸡胸肉', amount: '150g', protein: '35g' },
            { name: '米饭', amount: '150g', protein: '4g' },
            { name: '蔬菜', amount: '200g', protein: '2g' },
            { name: '橄榄油', amount: '10g', protein: '0g' }
          ],
          totalProtein: '41g',
          tips: '午餐保证碳水摄入，为下午训练提供能量'
        },
        dinner: {
          name: '高蛋白晚餐',
          time: '19:00',
          items: [
            { name: '鱼肉', amount: '150g', protein: '30g' },
            { name: '红薯', amount: '150g', protein: '2g' },
            { name: '蔬菜', amount: '200g', protein: '2g' },
            { name: '牛油果', amount: '半个', protein: '2g' }
          ],
          totalProtein: '36g',
          tips: '晚餐选择易消化的蛋白质，帮助夜间恢复'
        },
        snacks: {
          name: '加餐',
          time: '训练后/睡前',
          items: [
            { name: '蛋白粉', amount: '1 勺', protein: '25g' },
            { name: '坚果', amount: '30g', protein: '6g' },
            { name: '希腊酸奶', amount: '100g', protein: '10g' }
          ],
          totalProtein: '41g',
          tips: '训练后 30 分钟内补充蛋白质，促进肌肉恢复'
        }
      },
      weeklyTips: [
        '每周称重 1-2 次，调整热量摄入',
        '保证每日蛋白质摄入≥150g',
        '训练日适当增加碳水',
        '休息日适当减少碳水',
        '多喝水，促进代谢'
      ],
      shoppingList: [
        '鸡胸肉 1kg',
        '鱼肉 500g',
        '鸡蛋 20 个',
        '牛奶 2L',
        '蛋白粉 1 桶',
        '燕麦 500g',
        '米饭/红薯 适量',
        '蔬菜 适量',
        '坚果 200g',
        '希腊酸奶 500g'
      ]
    };
  }

  /**
   * 计算宏量营养素
   */
  calculateMacros(weight, goal = 'muscle-gain') {
    const configs = {
      'muscle-gain': { proteinPerKg: 2.0, caloriesMultiplier: 35, carbRatio: 0.45, fatRatio: 0.25 },
      'fat-loss': { proteinPerKg: 2.2, caloriesMultiplier: 28, carbRatio: 0.35, fatRatio: 0.30 },
      'maintenance': { proteinPerKg: 1.8, caloriesMultiplier: 32, carbRatio: 0.50, fatRatio: 0.25 }
    };

    const config = configs[goal] || configs['muscle-gain'];
    const calories = Math.round(weight * config.caloriesMultiplier);
    const protein = Math.round(weight * config.proteinPerKg);
    const carbs = Math.round(calories * config.carbRatio / 4);
    const fat = Math.round(calories * config.fatRatio / 9);

    return { calories, protein, carbs, fat };
  }
}

module.exports = { NutritionPlanner };
