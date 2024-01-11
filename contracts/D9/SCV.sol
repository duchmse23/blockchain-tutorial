// Bài: Tạo claimer contract, mỗi user được claim 1 lượng token cho trước. Sử dụng MerkleTree để xử lý:
// - Address1: 10
// - Address2: 20
// - Address3: 30
// - hàm claim(amount, proof)
// - cho phép thêm người được claim

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract SCV {
    address public test;
    bytes32 public root;

    constructor(bytes32 _root) {
        root = _root;
    }

    function claim(uint _amount, bytes32[] memory _proof) public {
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(msg.sender, _amount)))
        );
        require(MerkleProof.verify(_proof, root, leaf), "Invalid proof");
        test = msg.sender;
    }
}
