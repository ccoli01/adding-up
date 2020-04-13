'use strict'; //外部ファイル(モジュール)を読み込むことを目的に「import」と「require」が利用されているのを目にする機会があります。requireはnode.jsでサポートしている書き方
const fs = require('fs'); //fsは[FileSystem]の略で、ファイルを扱うためのモジュール。ここでは”fs”にrequireを用いてfsを代入しているイメージ？
const readline = require('readline'); //[readline]はファイルを一行ずつ読み込むためのモジュール

const rs = fs.createReadStream('./popu-pref.csv'); //popu-pref.csvファイルから、ファイルを読み込むStreamを生成して、さらにそれをreadlineオブジェクトのinputとして設定して、rlオブジェクトを作成している
const rl = readline.createInterface({'input':rs, 'output':{} });　//このコードは、rl オブジェクトで line というイベントが発生したら この無名関数を呼んでください、という意味です。
const prefectureDataMap = new Map(); //集計されたデータを格納する連想配列。添字となるキーkeyと値valueが何であるかはコメントに書いておくのがベター。key: 都道府県　value:　集計データのオブジェクト

rl.on('line', (lineString) => {
    const columns = lineString.split(','); //引数 lineString で与えられた文字列をカンマ , で分割して、それを columns という名前の配列にしています。
 //今回扱うファイルは各行が 集計年,都道府県名,10〜14歳の人口,15〜19歳の人口 という形式になっているので、これをカンマ , で分割すると ["集計年","都道府県名","10〜14歳の人口","15〜19歳の人口"] といった配列になります。
  
    const year = parseInt(columns[0]);　//年
    const prefecture = columns[1]; //都道府県。他のところにparseInt()　（パースイント）関数が使用されているのは、文字列で読み込まれている人口（数字）を”文字列”ではなく”数字”に変換するため。 
    const popu = parseInt(columns[3]); //15〜19歳の人口
  
    if(year ===2010 || year ===2015){　//「又は」
        let value = prefectureDataMap.get(prefecture);//prefectureDataMapからデータを取得している
        if(!value){　//valueの値がFalsyの場合に、valueに初期値となるオブジェクトを代入する。
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if(year === 2010) {
            value.popu10 = popu;
        }
        if(year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);　//人口データを連想配列に保存している。
    }
});

rl.on('close', () => { //'close' イベントは、全ての行を読み込み終わった際に呼び出されます。
  for(let [key, value] of prefectureDataMap){　//変化率の計算をしてvalue.changeに代入する
      value.change = value.popu15 / value.popu10; //for-of構文といいい、Map や Array の中身を of の前に与えられた変数に代入して for ループと同じことができます。
  }
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
      /*まず Array.from(prefectureDataMap) の部分で、連想配列を普通の配列に変換する処理をおこなっています。
        Keyとvalueの対を配列とし、その配列を要素とした配列（ペア配列）に変換されている。
        更に、Array の sort 関数を呼んで無名関数を渡しています。
        sortに対して渡すこの関数は「比較関数」といい、これによって並び替えをｓるうルールを決めることができる。
        比較関数では、
        ここで、pair1,pair2にはそれぞれ
      */
      return pair2[1].change - pair1[1].change;
      /*比較関数では以下のように並びを設定できる。ここでは、pair2-pair1>0、つまり正の数ということで降順にしている。
      function compare(a, b) {
        if (ある順序の基準において a が b より小) {
          return -1;
        }
       if (その順序の基準において a が b より大) {
         return 1;
        }
       // a は b と等しいはず
         return 0;
      }
      */
  });
  const rankingStrings = rankingArray.map(([key, value]) => {
      return key + ': ' + value.popu10 + '=>' + value.popu15 + '変化率：' + value.change;
  });
      /*「連想配列のMap」と「map関数」は別モン
         map関数は、Arrayの要素それぞれを、与えられた関数を適用した内容に変換するというもの。
         [key, value]で与えられたものを=>　｛新しく適応させる内容｝を適応させている。
      */
  console.log(rankingStrings);　//ここでアウトプットする
});
