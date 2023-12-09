export default function (
  /** @type {{ setGenerator: (arg0: string, arg1: { description: string; prompts: ({ type: string; name: string; message: string; choices?: undefined; } | { type: string; name: string; message: string; choices: string[]; })[]; actions: (data: any) => { type: string; path: string; templateFile: string; }[]; }) => void; }} */ plop,
) {
  plop.setGenerator('component', {
    description: '新しいコンポーネントとテストを作成します',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'コンポーネント名',
      },
    ],
    actions: function (data) {
      const componentName = data.name;
      const componentPath = `src/app/_components/${componentName}/`;
      return [
        {
          type: 'add',
          path: componentPath + '{{name}}.tsx',
          templateFile: 'plop-templates/component.tsx.hbs',
        },
        {
          type: 'add',
          path: componentPath + '{{name}}.test.tsx',
          templateFile: 'plop-templates/component.test.tsx.hbs',
        },
      ];
    },
  });
}
