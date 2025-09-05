type HelloProps = {
    name: string;
};

function Hello({ name }: HelloProps) {
    return <h2>Hello, {name}! 👋</h2>;
}

export default Hello;
