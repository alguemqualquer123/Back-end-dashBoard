const { parentPort } = require("worker_threads");
const { authenticator } = require("otplib");

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
parentPort.on("message", ({ users }) => {
  const update = () => {
    users.forEach((user) => {
      const code = generateCode();
      parentPort.postMessage({ id: user.id, code, email: user.email });
    });
  };
  update();
  setInterval(() => {
    update();
  }, process.env.TIME_RESET_CODE || 30 * 1000);
});
