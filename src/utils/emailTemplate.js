export const getEmailSubject = () => {
  return "【見学・空き状況のお問い合わせ】児童発達支援の利用について（李）";
};

export const getEmailBody = (serviceName) => {
  return `${serviceName} ご担当者様

初めてご連絡いたします。 

西宮市に住んでおります、李 烽（リ・ホウ）と申します。

3歳の息子の「児童発達支援」の利用を検討しており、貴施設の現在の空き状況と、見学の可否についてお伺いしたくご連絡いたしました。

■ 現在の状況 

・永瀬医院を受診し、通所のための「意見書」はすでに取得済みです。 

・西宮市役所（障害福祉課）へ受給者証の申請をするにあたり、まずは受け入れ可能な事業所を探して内定をもらうよう指示を受けております。

■ お伺いしたいこと 

１．現在、3歳児の受け入れ（空き枠）はありますでしょうか？ 

２．見学をお願いすることは可能でしょうか？（可能な場合、面談・見学の候補日時をいくつかご提示いただけますと幸いです）

■ 児童の情報 

・年齢：3歳 

・性別：男の子 

・現在の様子：母国語（中国語）の発達は問題ありませんが、日本語の理解がまだ不十分です。現在最も気になっているのは、自発的なコミュニケーションが少ない点です。
　幼稚園では先生に呼ばれてもあまり反応がなく、他のお友達と一緒に遊ぶ姿もあまり見られません。

■ 保護者の連絡先 

・氏名：李 烽（リ・ホウ） 

・住所：〒6638141 西宮市高須町1丁目 1　7-1408号

・電話番号：07090225051

お忙しいところ誠に恐縮ですが、ご返信いただけますと幸いです。 よろしくお願いいたします。`;
};

export const getGmailUrl = (email, serviceName) => {
  const subject = encodeURIComponent(getEmailSubject());
  const body = encodeURIComponent(getEmailBody(serviceName));
  const to = encodeURIComponent(email || '');
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
};

export const getMailtoUrl = (email, serviceName) => {
  const subject = encodeURIComponent(getEmailSubject());
  const body = encodeURIComponent(getEmailBody(serviceName));
  const to = encodeURIComponent(email || '');
  return `mailto:${to}?subject=${subject}&body=${body}`;
};
